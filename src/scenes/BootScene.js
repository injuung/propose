// =============================================================================
// BootScene.js : 타이틀 화면 — 갤럭시 S24 세로(450×940) 기준
// =============================================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('bg_title', 'assets/backgrounds/bg_title.png');
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // 가로 사진을 세로 화면에 cover 방식으로 표시
        const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_title');
        const scaleX = WIDTH  / bg.width;
        const scaleY = HEIGHT / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // 어두운 오버레이
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.50);

        // 타이틀 (2줄)
        this.add.text(WIDTH / 2, HEIGHT * 0.32, '우리가 함께하는\n새로운 시작', {
            fontFamily:      'serif',
            fontSize:        '40px',
            fill:            '#ffffff',
            fontStyle:       'italic',
            align:           'center',
            stroke:          '#000000',
            strokeThickness: 5,
            lineSpacing:     14,
        }).setOrigin(0.5);

        // 날짜 또는 서브 문구
        this.add.text(WIDTH / 2, HEIGHT * 0.50, '♡', {
            fontFamily: 'serif',
            fontSize:   '40px',
            fill:       '#ffcccc',
        }).setOrigin(0.5);

        this._createStartButton(WIDTH / 2, HEIGHT * 0.62);

        this.cameras.main.fadeIn(700, 0, 0, 0);
    }

    _createStartButton(x, y) {
        const btn = this.add.text(x, y, '[ 시작하기 ]', {
            fontFamily:      'sans-serif',
            fontSize:        '30px',
            fill:            '#f1c40f',
            backgroundColor: '#00000077',
            padding:         { x: 30, y: 14 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // 깜빡임
        this.tweens.add({
            targets: btn, alpha: 0.6, duration: 900, yoyo: true, repeat: -1,
        });

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
    }
}
