// =============================================================================
// LivingScene.js : Stage 3 - 거실
// 흐름: 입장 → 힌트 대사 → TV 클릭 → EndingScene(영상)
// =============================================================================
class LivingScene extends Phaser.Scene {
    constructor() { super('LivingScene'); }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildTVHotspot();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // 페이드인 후 힌트 대사 자동 시작
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            this.time.delayedCall(300, () => {
                this.dialog.start(GAME_CONFIG.DIALOGUES.living_hint, () => {});
            });
        });

        // 탭 → 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_living')
            .setDepth(0)
            .setDisplaySize(WIDTH, HEIGHT);

        // 밝기 보정 오버레이
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0.08)
            .setDepth(1);
    }

    // -------------------------------------------------------------------------

    _buildTVHotspot() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;

        const tvZone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5).setInteractive({ useHandCursor: true });

        this.tvHint = this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5).setStrokeStyle(3, 0xf1c40f, 0.9).setFillStyle(0xf1c40f, 0.08);

        this.tweens.add({
            targets: this.tvHint, alpha: 0.2,
            duration: 900, yoyo: true, repeat: -1,
        });

        // TV 영역 위 안내 텍스트
        this.tvLabel = this.add.text(pos.x, pos.y - pos.h / 2 - 18, '▶ TV 켜기', {
            fontFamily: 'sans-serif',
            fontSize:   '22px',
            fill:       '#f1c40f',
            stroke:     '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(6);

        tvZone.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            if (!this.dialog.isActive) this._playVideo();
        });
        tvZone.on('pointerover', () => {
            this.tvHint.setStrokeStyle(3, 0xffffff, 1);
            this.tvLabel.setStyle({ fill: '#ffffff' });
        });
        tvZone.on('pointerout', () => {
            this.tvHint.setStrokeStyle(3, 0xf1c40f, 0.9);
            this.tvLabel.setStyle({ fill: '#f1c40f' });
        });
    }

    // -------------------------------------------------------------------------

    _playVideo() {
        this.tvHint.destroy();
        this.tvLabel.destroy();

        const cfg      = GAME_CONFIG.ASSETS.video.propose;
        const videoKey = cfg.key;

        if (cfg.driveId || (cfg.url && this.cache.video.exists(videoKey))) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EndingScene');
            });
        } else {
            this._showVideoDummy();
        }
    }

    _showVideoDummy() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.92)
            .setDepth(80);

        this.add.text(WIDTH / 2, HEIGHT / 2 - 80,
            '[ 영상 재생 화면 ]\n영상 파일을 준비해주세요', {
            fontFamily: 'sans-serif', fontSize: '28px',
            fill: '#f1c40f', align: 'center',
        }).setOrigin(0.5).setDepth(81);

        const nextBtn = this.add.text(WIDTH / 2, HEIGHT / 2 + 80, '[ 엔딩으로 이동 → ]', {
            fontFamily: 'sans-serif', fontSize: '28px',
            fill: '#ffffff', backgroundColor: '#333333',
            padding: { x: 24, y: 12 },
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

    _buildDebugUI() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;
        this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(99).setStrokeStyle(2, 0xff0000, 1).setFillStyle(0xff0000, 0.1);

        const dbg = this.add.text(10, 10, '', {
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa',
        }).setDepth(100);
        this.input.on('pointermove', ptr => {
            dbg.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
