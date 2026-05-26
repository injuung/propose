// =============================================================================
// BootScene.js : 타이틀 화면
// =============================================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('bg_title', 'assets/backgrounds/bg_title.png');
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // 배경 사진 — 화면에 꽉 차도록 스케일 조정
        const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_title');
        const scaleX = WIDTH  / bg.width;
        const scaleY = HEIGHT / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // 어두운 오버레이 (텍스트 가독성 확보)
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.45);

        // 제목
        this.add.text(WIDTH / 2, HEIGHT / 2 - 70, '우리가 함께하는 새로운 시작', {
            fontFamily: 'serif',
            fontSize:   '56px',
            fill:       '#ffffff',
            fontStyle:  'italic',
            stroke:     '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this._createStartButton(WIDTH / 2, HEIGHT / 2 + 70);

        // 페이드인
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    _createStartButton(x, y) {
        const btn = this.add.text(x, y, '[ 시작하기 ]', {
            fontFamily: 'sans-serif', fontSize: '34px',
            fill: '#f1c40f', backgroundColor: '#00000066',
            padding: { x: 28, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
        btn.on('pointerout',  () => btn.setStyle({ fill: '#f1c40f' }));
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('QuizScene');
            });
        });
    }
}
