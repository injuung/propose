// =============================================================================
// DialogSystem.js : 타이핑 효과와 대화창 UI
// 대화창을 화면 중앙-하단(HEIGHT * 0.72)에 크고 명확하게 표시합니다
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
            // 타이핑 중이면 즉시 전체 텍스트 표시
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
        // 화면 높이의 72% 지점 (중앙-하단, 더 잘 보이는 위치)
        const posY = HEIGHT * 0.72;

        this.container = this.scene.add.container(WIDTH / 2, posY)
            .setDepth(50).setVisible(false);

        // 대화창 배경 (더 크고 밝은 테두리)
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-560, -70, 1120, 140, 20);
        bg.lineStyle(3, 0xf1c40f, 0.9);
        bg.strokeRoundedRect(-560, -70, 1120, 140, 20);

        // 대사 텍스트 (폰트 크기 업)
        this.textObj = this.scene.add.text(-520, -38, '', {
            fontFamily: 'sans-serif',
            fontSize:   '34px',
            fill:       '#ffffff',
            wordWrap:   { width: 1040 },
        });

        // "계속하려면 탭하세요" 아이콘 (▼ 깜빡임)
        this.nextIcon = this.scene.add.text(510, 40, '▼', {
            fontSize:   '26px',
            fill:       '#f1c40f',
        }).setOrigin(0.5);
        this.scene.tweens.add({
            targets:  this.nextIcon,
            alpha:    0,
            duration: 500,
            yoyo:     true,
            repeat:   -1,
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
