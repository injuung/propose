// =============================================================================
// LivingScene.js : Stage 3 - 거실
// 흐름: 입장 → 힌트 대사 (캐릭터 초상화) → TV 클릭 → EndingScene
// =============================================================================
class LivingScene extends Phaser.Scene {
    constructor() { super('LivingScene'); }

    preload() {
        if (!this.textures.exists('bg_living'))
            this.load.image('bg_living', 'assets/backgrounds/bg_living.png');
        if (!this.textures.exists('char_male'))
            this.load.image('char_male', 'assets/characters/char_male.png');
        if (!this.textures.exists('char_female'))
            this.load.image('char_female', 'assets/characters/char_female.png');
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildTVHotspot();
        this._createPortraits();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.time.delayedCall(400, () => {
            this.dialog.start(
                GAME_CONFIG.DIALOGUES.living_hint,
                () => {},
                (s) => this._onSpeakerChange(s)
            );
        });

        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_living')
            .setDepth(0).setDisplaySize(WIDTH, HEIGHT);
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0.08)
            .setDepth(1);
    }

    // -------------------------------------------------------------------------
    // 캐릭터 초상화
    // -------------------------------------------------------------------------

    _createPortraits() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const portY = HEIGHT * 0.68;

        this._portFemale = this._buildPortrait(WIDTH * 0.18, portY, 'char_female', 'female');
        this._portMale   = this._buildPortrait(WIDTH * 0.82, portY, 'char_male',   'male');

        this._portFemale.root.setAlpha(0);
        this._portMale.root.setAlpha(0);
    }

    _buildPortrait(x, y, textureKey, speakerKey) {
        const portSize  = 68;
        const nameColor = speakerKey === 'male' ? 0x88ccff : 0xffaabb;
        const cfg       = GAME_CONFIG.SPEAKERS[speakerKey];

        const root = this.add.container(x, y).setDepth(48);

        const bg = this.add.graphics();
        bg.fillStyle(0x111111, 0.82);
        bg.fillRoundedRect(-portSize / 2 - 4, -portSize / 2 - 4, portSize + 8, portSize + 8 + 26, 12);
        bg.lineStyle(2, nameColor, 0.85);
        bg.strokeRoundedRect(-portSize / 2 - 4, -portSize / 2 - 4, portSize + 8, portSize + 8 + 26, 12);

        let img = null;
        if (this.textures.exists(textureKey)) {
            const src = this.textures.get(textureKey).getSourceImage();
            const fH  = Math.floor(src.height * 0.40);
            const cSz = Math.min(src.width, fH);
            const cX  = Math.floor((src.width - cSz) / 2);
            img = this.add.image(0, 0, textureKey);
            img.setCrop(cX, 0, cSz, cSz);
            img.setDisplaySize(portSize, portSize);
        }

        const hex   = '#' + nameColor.toString(16).padStart(6, '0');
        const label = this.add.text(0, portSize / 2 + 14, cfg ? cfg.name : speakerKey, {
            fontFamily:      'sans-serif',
            fontSize:        '16px',
            fill:            hex,
            stroke:          '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const items = [bg, label];
        if (img) items.push(img);
        root.add(items);

        return { root };
    }

    _onSpeakerChange(speaker) {
        if (!this._portFemale || !this._portMale) return;
        if (speaker === null) {
            this.tweens.add({ targets: [this._portFemale.root, this._portMale.root], alpha: 0, duration: 300 });
            return;
        }
        const activePct   = 1.0;
        const inactivePct = 0.25;
        if (speaker === 'female') {
            this.tweens.add({ targets: this._portFemale.root, alpha: activePct,   duration: 180 });
            this.tweens.add({ targets: this._portMale.root,   alpha: inactivePct, duration: 180 });
        } else {
            this.tweens.add({ targets: this._portFemale.root, alpha: inactivePct, duration: 180 });
            this.tweens.add({ targets: this._portMale.root,   alpha: activePct,   duration: 180 });
        }
    }

    // -------------------------------------------------------------------------

    _buildTVHotspot() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;

        const tvZone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5).setInteractive({ useHandCursor: true });

        this.tvHint = this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(5)
            .setStrokeStyle(3, 0xf1c40f, 0.9)
            .setFillStyle(0xf1c40f, 0.06);

        this.tweens.add({
            targets: this.tvHint, alpha: 0.2,
            duration: 900, yoyo: true, repeat: -1,
        });

        this.tvLabel = this.add.text(pos.x, pos.y - pos.h / 2 - 16, '▶ TV 켜기', {
            fontFamily:      'sans-serif',
            fontSize:        '20px',
            fill:            '#f1c40f',
            stroke:          '#000000',
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

    _playVideo() {
        this.tvHint.destroy();
        this.tvLabel.destroy();

        const cfg = GAME_CONFIG.ASSETS.video.propose;

        if (cfg.driveId || (cfg.url && this.cache.video.exists(cfg.key))) {
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

        this.add.text(WIDTH / 2, HEIGHT / 2 - 60,
            '[ 영상 재생 화면 ]\n영상 파일을 준비해주세요', {
            fontFamily: 'sans-serif', fontSize: '22px',
            fill: '#f1c40f', align: 'center',
        }).setOrigin(0.5).setDepth(81);

        const nextBtn = this.add.text(WIDTH / 2, HEIGHT / 2 + 80, '[ 엔딩으로 이동 → ]', {
            fontFamily: 'sans-serif', fontSize: '22px',
            fill: '#ffffff', backgroundColor: '#333333',
            padding: { x: 20, y: 12 },
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

    _buildDebugUI() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;
        this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(99).setStrokeStyle(2, 0xff0000, 1).setFillStyle(0xff0000, 0.1);

        const dbg = this.add.text(10, 10, '', {
            font: '16px monospace', fill: '#00ff00', backgroundColor: '#000000aa',
        }).setDepth(100);
        this.input.on('pointermove', ptr => {
            dbg.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
