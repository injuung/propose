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

        this._layout = this._calcLayout();
        this._buildUI();
    }

    _calcLayout() {
        const { WIDTH, HEIGHT, UI } = GAME_CONFIG;
        const dlg = UI.DIALOG;
        const nav = UI.NAV_BAR;
        const boxW = WIDTH - 16;
        const boxH = dlg.BOX_HEIGHT;
        const posY = HEIGHT - nav.BOTTOM_PAD - nav.HEIGHT - dlg.GAP_ABOVE_NAV - boxH / 2;

        return { boxW, boxH, posY, dlg };
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
        const { WIDTH } = GAME_CONFIG;
        const { boxW, boxH, posY, dlg } = this._layout;

        this.container = this.scene.add.container(WIDTH / 2, posY)
            .setDepth(50).setVisible(false);

        this._bg = this.scene.add.graphics();
        this._drawBox(this._bg, boxW, boxH);

        this._nameLabel = this.scene.add.text(
            -boxW / 2 + 12, -boxH / 2 + 6, '', {
            fontFamily:      'sans-serif',
            fontSize:        `${dlg.NAME_FONT_SIZE}px`,
            fontStyle:       'bold',
            fill:            '#f1c40f',
            stroke:          '#000000',
            strokeThickness: 2,
        }).setVisible(false);

        this._divider = this.scene.add.graphics();

        this.textObj = this.scene.add.text(
            -boxW / 2 + 12, -boxH / 2 + 12, '', {
            fontFamily:  'sans-serif',
            fontSize:    `${dlg.FONT_SIZE}px`,
            fill:        '#ffffff',
            wordWrap:    { width: boxW - 24 },
            lineSpacing: dlg.LINE_SPACING,
        });

        this.nextIcon = this.scene.add.text(
            boxW / 2 - 16, boxH / 2 - 14, '▼', {
            fontSize: `${Math.max(12, dlg.FONT_SIZE - 2)}px`,
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
        g.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
        g.lineStyle(2, 0xf1c40f, 0.95);
        g.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
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
        const { boxW, boxH } = this._layout;

        this._divider.clear();

        if (!speaker || !GAME_CONFIG.SPEAKERS || !GAME_CONFIG.SPEAKERS[speaker]) {
            this._nameLabel.setVisible(false);
            this.textObj.setPosition(-boxW / 2 + 12, -boxH / 2 + 12);
            return;
        }

        const cfg       = GAME_CONFIG.SPEAKERS[speaker];
        const nameColor = speaker === 'male' ? '#88ccff' : '#ffaabb';
        const lineColor = speaker === 'male' ? 0x88ccff   : 0xffaabb;

        this._nameLabel
            .setPosition(-boxW / 2 + 12, -boxH / 2 + 6)
            .setText(cfg.name)
            .setStyle({ fill: nameColor })
            .setVisible(true);

        this._divider.lineStyle(1, lineColor, 0.4);
        this._divider.lineBetween(
            -boxW / 2 + 8, -boxH / 2 + 26,
             boxW / 2 - 8, -boxH / 2 + 26
        );

        this.textObj.setPosition(-boxW / 2 + 12, -boxH / 2 + 30);
    }

    _typewrite(text) {
        this.isTyping = true;
        this.fullText = text;
        this.textObj.setText('');
        this.nextIcon.setVisible(false);
        if (this.typeTimer) this.typeTimer.remove();

        const delay = GAME_CONFIG.UI.DIALOG.TYPE_DELAY_MS;
        let i = 0;
        this.typeTimer = this.scene.time.addEvent({
            delay,
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
