// =============================================================================
// LivingScene.js : Stage 3 - 거실
// 이벤트: TV(핫스팟) 클릭 → 영상 재생 → EndingScene
// 이스터에그: 추후 작성 예정 (config.js에 DIALOGUES.living_easter_egg 추가)
// =============================================================================
class LivingScene extends Phaser.Scene {
    constructor() { super('LivingScene'); }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);

        this._buildBackground();
        this._buildTVHotspot();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // 입장 시 힌트 대사 (약간의 딜레이 후)
        this.time.delayedCall(700, () => {
            this.dialog.start(GAME_CONFIG.DIALOGUES.living_hint, () => {});
        });

        // 화면 클릭 시 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------
    // 배경
    // -------------------------------------------------------------------------
    _buildBackground() {
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'bg_living')
            .setDepth(0)
            .setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    }

    // -------------------------------------------------------------------------
    // TV 핫스팟
    // -------------------------------------------------------------------------
    _buildTVHotspot() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;

        const tvZone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5).setInteractive({ useHandCursor: true });

        this.tvHint = this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5).setStrokeStyle(3, 0xf1c40f, 0.7).setFillStyle(0x000000, 0);

        this.tweens.add({
            targets: this.tvHint, alpha: 0.15,
            duration: 1000, yoyo: true, repeat: -1
        });

        tvZone.on('pointerdown', () => {
            if (!this.dialog.isActive) this._playVideo();
        });
        tvZone.on('pointerover', () => this.tvHint.setStrokeStyle(3, 0xffffff, 1));
        tvZone.on('pointerout',  () => this.tvHint.setStrokeStyle(3, 0xf1c40f, 0.7));
    }

    // -------------------------------------------------------------------------
    // TV 클릭 → 영상 재생 or 더미 처리
    // -------------------------------------------------------------------------
    _playVideo() {
        this.tvHint.destroy();

        const videoKey = GAME_CONFIG.ASSETS.video.propose.key;

        if (this.cache.video.exists(videoKey)) {
            // 실제 영상: EndingScene으로 이동해 풀스크린 재생
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EndingScene');
            });
        } else {
            // 영상 파일 없을 때 더미 UI
            this._showVideoDummy();
        }
    }

    _showVideoDummy() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.92)
            .setDepth(80);

        this.add.text(WIDTH / 2, HEIGHT / 2 - 80,
            '[ 영상 재생 화면 ]\nassets/video/propose.mp4 를 넣어주세요', {
            fontFamily: 'sans-serif', fontSize: '28px',
            fill: '#f1c40f', align: 'center'
        }).setOrigin(0.5).setDepth(81);

        const nextBtn = this.add.text(WIDTH / 2, HEIGHT / 2 + 80, '[ 엔딩으로 이동 → ]', {
            fontFamily: 'sans-serif', fontSize: '28px',
            fill: '#ffffff', backgroundColor: '#333333',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });

        nextBtn.on('pointerover', () => nextBtn.setStyle({ fill: '#f1c40f' }));
        nextBtn.on('pointerout',  () => nextBtn.setStyle({ fill: '#ffffff' }));
        nextBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EndingScene');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 디버그 UI
    // -------------------------------------------------------------------------
    _buildDebugUI() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;

        this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(99).setStrokeStyle(2, 0xff0000, 1).setFillStyle(0xff0000, 0.1);

        this.debugText = this.add.text(10, 10, '', {
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa'
        }).setDepth(100);
        this.input.on('pointermove', (ptr) => {
            this.debugText.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
