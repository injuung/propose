// =============================================================================
// DialogSystem.js : 타이핑 대화창 — 갤럭시 S24 세로(450×940) 기준
// 대화창은 화면 하단 79% 지점에 전체 너비로 표시됩니다
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
        const boxW  = WIDTH - 20;   // 430px  (좌우 10px 여백)
        const boxH  = 160;
        const posY  = HEIGHT * 0.79; // 743px

        this.container = this.scene.add.container(WIDTH / 2, posY)
            .setDepth(50).setVisible(false);

        // 배경 박스
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.88);
        bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
        bg.lineStyle(2.5, 0xf1c40f, 0.95);
        bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);

        // 대사 텍스트
        this.textObj = this.scene.add.text(
            -boxW / 2 + 18, -boxH / 2 + 16, '', {
            fontFamily: 'sans-serif',
            fontSize:   '26px',
            fill:       '#ffffff',
            wordWrap:   { width: boxW - 40 },
            lineSpacing: 6,
        });

        // ▼ 다음 아이콘
        this.nextIcon = this.scene.add.text(
            boxW / 2 - 22, boxH / 2 - 22, '▼', {
            fontSize: '20px',
            fill:     '#f1c40f',
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: this.nextIcon, alpha: 0,
            duration: 500, yoyo: true, repeat: -1,
        });
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
            delay:  40,
            repeat: text.length - 1,
            callback: () => {
                this.textObj.text += text[i++];
                if (i === text.length) {
                    this.isTyping = false;
                    this.nextIcon.setVisible(true);
                }
            },
        });
    }
}
