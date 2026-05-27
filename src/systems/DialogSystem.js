// =============================================================================
// DialogSystem.js : 타이핑 대화창 + 발화자 이름 표시
//
// start(lines, onComplete, onSpeakerChange)
//   lines            : [{text, speaker}] 또는 [string] 배열
//   onComplete       : 마지막 줄 끝난 후 호출되는 콜백
//   onSpeakerChange  : 발화자가 바뀔 때 호출 (speaker | null)
// =============================================================================
class DialogSystem {
    constructor(scene) {
        this.scene           = scene;
        this.isActive        = false;
        this.isTyping        = false;
        this.currentIndex    = 0;
        this.fullText        = '';
        this.typeTimer       = null;
        this.onComplete      = null;
        this.onSpeakerChange = null;
        this.lines           = [];

        this._buildUI();
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    start(lines, onComplete, onSpeakerChange = null) {
        this.lines           = lines;
        this.onComplete      = onComplete;
        this.onSpeakerChange = onSpeakerChange;
        this.currentIndex    = 0;
        this.isActive        = true;
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

    // -------------------------------------------------------------------------
    // UI 구성
    // -------------------------------------------------------------------------

    _buildUI() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const boxW = WIDTH - 20;
        const boxH = 185;
        const posY = HEIGHT * 0.79;

        this.container = this.scene.add.container(WIDTH / 2, posY)
            .setDepth(50).setVisible(false);

        // --- 배경 박스 ---
        this._bg = this.scene.add.graphics();
        this._drawBox(this._bg, boxW, boxH);

        // --- 발화자 이름 라벨 (평소엔 숨김) ---
        this._nameLabel = this.scene.add.text(
            -boxW / 2 + 16, -boxH / 2 + 10, '', {
            fontFamily:      'sans-serif',
            fontSize:        '17px',
            fontStyle:       'bold',
            fill:            '#f1c40f',
            stroke:          '#000000',
            strokeThickness: 3,
        }).setVisible(false);

        // --- 구분선 (발화자 이름 아래) ---
        this._divider = this.scene.add.graphics();

        // --- 대사 텍스트 ---
        this.textObj = this.scene.add.text(
            -boxW / 2 + 16, -boxH / 2 + 16, '', {
            fontFamily:  'sans-serif',
            fontSize:    '24px',
            fill:        '#ffffff',
            wordWrap:    { width: boxW - 36 },
            lineSpacing: 6,
        });

        // --- ▼ 다음 아이콘 ---
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

        this.container.add([
            this._bg, this._divider,
            this._nameLabel, this.textObj, this.nextIcon,
        ]);
    }

    _drawBox(g, boxW, boxH) {
        g.clear();
        g.fillStyle(0x000000, 0.88);
        g.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
        g.lineStyle(2.5, 0xf1c40f, 0.95);
        g.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
    }

    // -------------------------------------------------------------------------
    // 라인 표시
    // -------------------------------------------------------------------------

    _showLine() {
        if (this.currentIndex < this.lines.length) {
            const line    = this.lines[this.currentIndex++];
            const text    = (typeof line === 'object') ? line.text    : line;
            const speaker = (typeof line === 'object') ? line.speaker : null;

            this._updateSpeakerLabel(speaker);

            if (this.onSpeakerChange) this.onSpeakerChange(speaker);

            this._typewrite(text);
        } else {
            this.container.setVisible(false);
            this.isActive = false;
            if (this.onSpeakerChange) this.onSpeakerChange(null);
            if (this.onComplete)      this.onComplete();
        }
    }

    _updateSpeakerLabel(speaker) {
        const { WIDTH } = GAME_CONFIG;
        const boxW  = WIDTH - 20;
        const boxH  = 185;

        this._divider.clear();

        if (!speaker || !GAME_CONFIG.SPEAKERS || !GAME_CONFIG.SPEAKERS[speaker]) {
            // 발화자 없음 — 텍스트를 위에서부터 표시
            this._nameLabel.setVisible(false);
            this.textObj.setPosition(-boxW / 2 + 16, -boxH / 2 + 16);
            return;
        }

        const cfg       = GAME_CONFIG.SPEAKERS[speaker];
        const nameColor = speaker === 'male' ? '#88ccff' : '#ffaabb';
        const lineColor = speaker === 'male' ? 0x88ccff   : 0xffaabb;

        // 이름 라벨
        this._nameLabel
            .setPosition(-boxW / 2 + 16, -boxH / 2 + 10)
            .setText(cfg.name)
            .setStyle({ fill: nameColor })
            .setVisible(true);

        // 구분선
        this._divider.lineStyle(1, lineColor, 0.5);
        this._divider.lineBetween(
            -boxW / 2 + 12, -boxH / 2 + 38,
             boxW / 2 - 12, -boxH / 2 + 38
        );

        // 텍스트를 이름 아래로 내림
        this.textObj.setPosition(-boxW / 2 + 16, -boxH / 2 + 46);
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
