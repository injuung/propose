// =============================================================================
// BootScene.js : 타이틀 화면 — 정문의 "할말이 있어" 도입부
// =============================================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('bg_title', 'assets/backgrounds/bg_title.png');
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // 배경
        const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_title');
        const scaleX = WIDTH  / bg.width;
        const scaleY = HEIGHT / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // 어두운 오버레이
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.55);

        // 메인 타이틀
        const titleObj = this.add.text(WIDTH / 2, HEIGHT * 0.32, '우리의\n행복한 시작', {
            fontFamily:      'serif',
            fontSize:        Math.round(WIDTH * 0.11) + 'px',
            fill:            '#ffffff',
            fontStyle:       'italic bold',
            stroke:          '#000000',
            strokeThickness: 4,
            lineSpacing:     14,
            align:           'center',
            shadow:          { offsetX: 0, offsetY: 3, color: '#aaaaff', blur: 14, fill: true },
        }).setOrigin(0.5).setAlpha(0);

        // 서브 문구
        const subText = this.add.text(WIDTH / 2, HEIGHT * 0.58, '', {
            fontFamily:  'serif',
            fontSize:    Math.round(WIDTH * 0.058) + 'px',
            fill:        '#f1c40f',
            fontStyle:   'italic',
            stroke:      '#000000',
            strokeThickness: 2,
            letterSpacing: 4,
            align:       'center',
        }).setOrigin(0.5).setAlpha(0);

        // 시작 버튼 (처음엔 숨김)
        const btn = this._createStartButton(WIDTH / 2, HEIGHT * 0.74);
        btn.setAlpha(0);

        // 연출 순서: 페이드인 → 타이틀 등장 → Coming Soon 타이핑 → 버튼 등장
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.time.delayedCall(700, () => {
            this.tweens.add({
                targets: titleObj, alpha: 1, y: HEIGHT * 0.30,
                duration: 800, ease: 'Sine.easeOut',
                onComplete: () => {
                    this.time.delayedCall(300, () => {
                        subText.setAlpha(1);
                        this._typewrite(subText, '— Coming Soon —', 70, () => {
                            this.time.delayedCall(500, () => {
                                this.tweens.add({
                                    targets: btn, alpha: 1, duration: 500,
                                    onComplete: () => {
                                        this.tweens.add({
                                            targets: btn, alpha: 0.6,
                                            duration: 900, yoyo: true, repeat: -1,
                                        });
                                    },
                                });
                            });
                        });
                    });
                },
            });
        });
    }

    _typewrite(textObj, fullText, delay, onComplete) {
        textObj.setText('');
        let i = 0;
        this.time.addEvent({
            delay,
            repeat: fullText.length - 1,
            callback: () => {
                textObj.text += fullText[i++];
                if (i === fullText.length && onComplete) onComplete();
            },
        });
    }

    _createStartButton(x, y) {
        const { WIDTH } = GAME_CONFIG;
        const fontSize = Math.round(Math.max(18, Math.min(26, WIDTH * 0.060))) + 'px';
        const btn = this.add.text(x, y, '[ 시작하기 ]', {
            fontFamily:      'sans-serif',
            fontSize,
            fill:            '#f1c40f',
            backgroundColor: '#00000077',
            padding:         { x: 24, y: 12 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.killTweensOf(btn);
            btn.setStyle({ fill: '#ffffff' }).setAlpha(1);
        });
        btn.on('pointerout', () => {
            btn.setStyle({ fill: '#f1c40f' });
            this.tweens.add({
                targets: btn, alpha: 0.6, duration: 900, yoyo: true, repeat: -1,
            });
        });
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('QuizScene');
            });
        });

        return btn;
    }
}
