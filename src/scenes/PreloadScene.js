// =============================================================================
// PreloadScene.js : 전체 에셋 로드
// DriveUrl 유틸을 통해 Google Drive / 로컬 경로를 자동 선택합니다
// =============================================================================
class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    preload() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this._createLoadingUI();

        // Google Drive 이미지 로드 시 CORS 허용 (lh3.googleusercontent.com은 허용됨)
        this.load.setCrossOrigin('anonymous');

        const fallback = new AssetFallback(this);
        this.load.on('loaderror', (file) => fallback.generate(file));

        this._loadImages();
        this._loadAudio();
        // 영상은 driveId 방식이면 PreloadScene에서 로드하지 않음 (EndingScene에서 iframe 처리)
        this._loadVideoIfLocal();
    }

    create() {
        // BGM 시작 (로드 성공한 경우만)
        const bgmCfg = GAME_CONFIG.ASSETS.audio.bgm;
        if (this.cache.audio.exists(bgmCfg.key)) {
            this.sound.add(bgmCfg.key, { loop: bgmCfg.loop, volume: bgmCfg.volume }).play();
        }

        this.scene.start('RoomScene');
    }

    // -------------------------------------------------------------------------

    _createLoadingUI() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const cx = WIDTH / 2;
        const cy = HEIGHT / 2;

        this.add.text(cx, cy - 60, '추억을 불러오는 중...', {
            fontFamily: 'sans-serif', fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);

        const bgBar = this.add.graphics();
        bgBar.fillStyle(0x333333, 1);
        bgBar.fillRect(cx - 220, cy, 440, 22);

        const bar     = this.add.graphics();
        const pctText = this.add.text(cx, cy + 40, '', {
            fontFamily: 'sans-serif', fontSize: '20px', fill: '#888888'
        }).setOrigin(0.5);

        this.load.on('progress', (v) => {
            bar.clear();
            bar.fillStyle(0xf1c40f, 1);
            bar.fillRect(cx - 218, cy + 2, 436 * v, 18);
            pctText.setText(`${Math.round(v * 100)}%`);
        });
    }

    _loadImages() {
        const { backgrounds, characters, objects } = GAME_CONFIG.ASSETS;
        const allImages = [
            ...Object.values(backgrounds),
            ...Object.values(characters),
            ...Object.values(objects),
        ];

        allImages.forEach(asset => {
            const url = DriveUrl.resolve(asset, 'image');
            if (url) this.load.image(asset.key, url);
        });
    }

    _loadAudio() {
        Object.values(GAME_CONFIG.ASSETS.audio).forEach(asset => {
            const url = DriveUrl.resolve(asset, 'audio');
            if (url) this.load.audio(asset.key, url);
        });
    }

    _loadVideoIfLocal() {
        const vid = GAME_CONFIG.ASSETS.video.propose;
        // driveId가 있으면 iframe으로 처리하므로 여기서 로드 생략
        if (!vid.driveId && vid.url) {
            this.load.video(vid.key, vid.url);
        }
    }
}
