// =============================================================================
// BootScene.js : 타이틀 화면
// =============================================================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.add.text(WIDTH / 2, HEIGHT / 2 - 60, '우리의 이야기', {
            fontFamily: 'serif', fontSize: '72px',
            fill: '#ffffff', fontStyle: 'italic'
        }).setOrigin(0.5);

        this._createStartButton(WIDTH / 2, HEIGHT / 2 + 70);
    }

    _createStartButton(x, y) {
        const btn = this.add.text(x, y, '[ 시작하기 ]', {
            fontFamily: 'sans-serif', fontSize: '34px',
            fill: '#f1c40f', backgroundColor: '#2a2a2a',
            padding: { x: 28, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
        btn.on('pointerout',  () => btn.setStyle({ fill: '#f1c40f' }));
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('PreloadScene');
            });
        });
    }
}
