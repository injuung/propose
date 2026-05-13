// =============================================================================
// PreloadScene.js : 전체 에셋 로드 (실패 시 AssetFallback 자동 적용)
// =============================================================================
class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    preload() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this._createLoadingUI();

        const fallback = new AssetFallback(this);
        this.load.on('loaderror', (file) => fallback.generate(file));

        this._loadAll();
    }

    create() {
        // BGM 시작 (로드 성공한 경우만)
        const { bgm } = GAME_CONFIG.ASSETS.audio;
        if (this.cache.audio.exists(bgm.key)) {
            this.sound.add(bgm.key, { loop: bgm.loop, volume: bgm.volume }).play();
        }

        this.scene.start('RoomScene');
    }

    // --- Private ---

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

        const bar = this.add.graphics();
        this.load.on('progress', (v) => {
            bar.clear();
            bar.fillStyle(0xf1c40f, 1);
            bar.fillRect(cx - 218, cy + 2, 436 * v, 18);
        });

        const pctText = this.add.text(cx, cy + 40, '', {
            fontFamily: 'sans-serif', fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5);
        this.load.on('progress', (v) => pctText.setText(`${Math.round(v * 100)}%`));
    }

    _loadAll() {
        const { backgrounds, characters, objects, audio, video } = GAME_CONFIG.ASSETS;

        // 배경
        Object.values(backgrounds).forEach(a => this.load.image(a.key, a.url));

        // 캐릭터
        Object.values(characters).forEach(a => this.load.image(a.key, a.url));

        // 오브젝트
        Object.values(objects).forEach(a => this.load.image(a.key, a.url));

        // 오디오
        Object.values(audio).forEach(a => this.load.audio(a.key, a.url));

        // 영상 (Google Drive 사용 시 로컬 로드 생략)
        Object.values(video).forEach(a => {
            if (!a.driveId && a.url) this.load.video(a.key, a.url);
        });
    }
}
