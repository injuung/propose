// =============================================================================
// LivingScene.js : Stage 3 - 거실
// 흐름: 입장 → 힌트 대사 (캐릭터 전신 표시) → TV 클릭 → EndingScene
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

        removeBgFromTexture(this, 'char_male',   'char_male_nobg');
        removeBgFromTexture(this, 'char_female', 'char_female_nobg');
        this._createCharacters();

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

        this.input.on('pointerdown', () => {
            if (this.dialog.isActive) this.dialog.advance();
        });

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
    // 캐릭터 전신 배치
    // -------------------------------------------------------------------------

    _createCharacters() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const feetY = Math.round(HEIGHT * 0.87);

        this._charFemale = this._buildCharSprite(WIDTH * 0.22, feetY, 'char_female', 'female');
        this._charMale   = this._buildCharSprite(WIDTH * 0.78, feetY, 'char_male',   'male');

        this._charFemale.root.setAlpha(0);
        this._charMale.root.setAlpha(0);
    }

    _buildCharSprite(x, y, textureKey, speakerKey) {
        const { HEIGHT } = GAME_CONFIG;
        const cfg       = GAME_CONFIG.SPEAKERS[speakerKey];
        const nameColor = speakerKey === 'male' ? 0x88ccff : 0xffaabb;

        const root = this.add.container(x, y).setDepth(12);

        const useKey = this.textures.exists(textureKey + '_nobg') ? textureKey + '_nobg' : textureKey;

        let img = null;
        if (this.textures.exists(useKey)) {
            const src     = this.textures.get(useKey).getSourceImage();
            const targetH = Math.round(HEIGHT * 0.46);
            const scale   = targetH / src.height;
            img = this.add.image(0, 0, useKey);
            img.setScale(scale);
            img.setOrigin(0.5, 1);
        }

        const charH  = img ? img.displayHeight : 0;
        const hex    = '#' + nameColor.toString(16).padStart(6, '0');
        const label  = this.add.text(0, -(charH + 6), cfg ? cfg.name : speakerKey, {
            fontFamily:      'sans-serif',
            fontSize:        '13px',
            fill:            hex,
            stroke:          '#000000',
            strokeThickness: 4,
            backgroundColor: '#00000077',
            padding:         { x: 7, y: 3 },
        }).setOrigin(0.5, 1);

        const items = [];
        if (img) items.push(img);
        items.push(label);
        root.add(items);

        return { root };
    }

    _onSpeakerChange(speaker) {
        if (!this._charFemale || !this._charMale) return;
        if (speaker === null) {
            this.tweens.add({
                targets: [this._charFemale.root, this._charMale.root],
                alpha: 0, duration: 400,
            });
            return;
        }
        const active   = 1.0;
        const inactive = 0.28;
        if (speaker === 'female') {
            this.tweens.add({ targets: this._charFemale.root, alpha: active,   duration: 180 });
            this.tweens.add({ targets: this._charMale.root,   alpha: inactive, duration: 180 });
        } else {
            this.tweens.add({ targets: this._charFemale.root, alpha: inactive, duration: 180 });
            this.tweens.add({ targets: this._charMale.root,   alpha: active,   duration: 180 });
        }
    }

    // -------------------------------------------------------------------------

    _buildTVHotspot() {
        const pos = GAME_CONFIG.POSITIONS.living.tv_hotspot;

        const tvZone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(20).setInteractive({ useHandCursor: true });

        tvZone.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            if (!this.dialog.isActive) this._playVideo();
        });

        if (GAME_CONFIG.DEBUG_MODE) {
            this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
                .setDepth(99).setStrokeStyle(2, 0xff0000, 1).setFillStyle(0xff0000, 0.15);
            this.add.text(pos.x, pos.y, '▶ TV 클릭 영역', {
                fontFamily: 'monospace', fontSize: '14px', fill: '#ff4444',
                backgroundColor: '#000000aa', padding: { x: 6, y: 4 },
            }).setOrigin(0.5).setDepth(100);
        }
    }

    _playVideo() {
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
