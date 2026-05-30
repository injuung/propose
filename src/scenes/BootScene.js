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

        // 이름 + 하트
        const nameObj = this.add.text(WIDTH / 2, HEIGHT * 0.30, '정문 ♥', {
            fontFamily:      'serif',
            fontSize:        Math.round(WIDTH * 0.115) + 'px',
            fill:            '#ffaabb',
            fontStyle:       'bold',
            stroke:          '#000000',
            strokeThickness: 4,
            shadow:          { offsetX: 0, offsetY: 2, color: '#ff6688', blur: 12, fill: true },
        }).setOrigin(0.5).setAlpha(0);

        // 서브 대사 (타이핑 효과)
        const subText = this.add.text(WIDTH / 2, HEIGHT * 0.50, '', {
            fontFamily:  'serif',
            fontSize:    Math.round(WIDTH * 0.065) + 'px',
            fill:        '#ffffff',
            fontStyle:   'italic',
            stroke:      '#000000',
            strokeThickness: 3,
            lineSpacing: 10,
            align:       'center',
        }).setOrigin(0.5).setAlpha(0);

        // 시작 버튼 (처음엔 숨김)
        const btn = this._createStartButton(WIDTH / 2, HEIGHT * 0.70);
        btn.setAlpha(0);

        // 연출 순서: 페이드인 → 이름 등장 → 타이핑 → 버튼 등장
        this.cameras.main.fadeIn(800, 0, 0, 0);

        this.time.delayedCall(600, () => {
            this.tweens.add({
                targets: nameObj, alpha: 1, y: HEIGHT * 0.28,
                duration: 700, ease: 'Back.easeOut',
                onComplete: () => {
                    subText.setAlpha(1);
                    this._typewrite(subText, '할말이 있어...', 80, () => {
                        this.time.delayedCall(400, () => {
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
