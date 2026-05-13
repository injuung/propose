// =============================================================================
// DialogSystem.js : 타이핑 효과와 대화창 UI를 담당하는 클래스
// =============================================================================
class DialogSystem {
    constructor(scene) {
        this.scene        = scene;
        this.isActive     = false;
        this.isTyping     = false;
        this.currentIndex = 0;
        this.fullText     = '';
        this.typeTimer    = null;
        this.onComplete   = null;
        this.lines        = [];

        this._buildUI();
    }

    // --- Public API ---

    start(dialogues, onComplete) {
        this.lines        = dialogues;
        this.onComplete   = onComplete;
        this.currentIndex = 0;
        this.isActive     = true;
        this.container.setVisible(true);
        this._showLine();
    }

    advance() {
        if (!this.isActive) return;
        if (this.isTyping) {
            this.typeTimer.remove();
            this.textObj.setText(this.fullText);
            this.isTyping = false;
            this.nextIcon.setVisible(true);
        } else {
            this._showLine();
        }
    }

    // --- Private ---

    _buildUI() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.container = this.scene.add.container(WIDTH / 2, HEIGHT - 120).setDepth(50).setVisible(false);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(-500, -60, 1000, 120, 16);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-500, -60, 1000, 120, 16);

        this.textObj = this.scene.add.text(-460, -30, '', {
            fontFamily: 'sans-serif', fontSize: '32px', fill: '#ffffff',
            wordWrap: { width: 920 }
        });

        this.nextIcon = this.scene.add.text(450, 20, '▼', { fontSize: '24px', fill: '#f1c40f' });
        this.scene.tweens.add({ targets: this.nextIcon, alpha: 0, duration: 500, yoyo: true, repeat: -1 });
        this.nextIcon.setVisible(false);

        this.container.add([bg, this.textObj, this.nextIcon]);
    }

    _showLine() {
        if (this.currentIndex < this.lines.length) {
            this._typewrite(this.lines[this.currentIndex++]);
        } else {
            this.container.setVisible(false);
            this.isActive = false;
            if (this.onComplete) this.onComplete();
        }
    }

    _typewrite(text) {
        this.isTyping = true;
        this.fullText = text;
        this.textObj.setText('');
        this.nextIcon.setVisible(false);
        if (this.typeTimer) this.typeTimer.remove();

        let i = 0;
        this.typeTimer = this.scene.time.addEvent({
            delay: 50,
            repeat: text.length - 1,
            callback: () => {
                this.textObj.text += text[i++];
                if (i === text.length) {
                    this.isTyping = false;
                    this.nextIcon.setVisible(true);
                }
            }
        });
    }
}
