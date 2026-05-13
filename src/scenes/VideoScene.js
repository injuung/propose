// =============================================================================
// VideoScene.js : 프로포즈 영상 재생 및 엔딩
// =============================================================================
class VideoScene extends Phaser.Scene {
    constructor() { super('VideoScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(2000, 0, 0, 0);
        this.sound.stopAll();

        if (this.cache.video.exists(GAME_CONFIG.ASSETS.video.key)) {
            this._setupVideo();
        } else {
            this._setupDummy();
        }
    }

    _setupVideo() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const video = this.add.video(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.ASSETS.video.key);
        video.setScale(Math.max(WIDTH / video.width, HEIGHT / video.height));
        video.on('complete', () => this._showEnding());

        const hint = this.add.text(WIDTH / 2, HEIGHT / 2, '화면을 클릭하여 영상 재생', {
            fontFamily: 'sans-serif', fontSize: '36px', fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 20, y: 20 }
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            hint.setVisible(false);
            video.play();
            if (!this.scale.isFullscreen) this.scale.startFullscreen();
        });
    }

    _setupDummy() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const msg = this.add.text(WIDTH / 2, HEIGHT / 2 - 100,
            '[ 영상 재생 화면 ]\n(비디오 에셋이 없어 생략합니다)\n\n화면을 클릭하면 엔딩으로 넘어갑니다.', {
            fontFamily: 'sans-serif', fontSize: '32px', fill: '#f1c40f', align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            msg.setVisible(false);
            this._showEnding();
        });
    }

    _showEnding() {
        const text = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'Will you marry me?', {
            fontFamily: 'serif', fontSize: '80px', fill: '#ffffff', fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: text, alpha: 1, duration: 3000 });
    }
}
