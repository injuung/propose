// =============================================================================
// KitchenScene.js : Stage 2 - 부엌
// 흐름: 씬 입장 → 탭 힌트 → 대사 (캐릭터 전신 표시) → 거실 이동 버튼
// =============================================================================
class KitchenScene extends Phaser.Scene {
    constructor() { super('KitchenScene'); }

    preload() {
        if (!this.textures.exists('bg_kitchen'))
            this.load.image('bg_kitchen', 'assets/backgrounds/bg_kitchen.png');
        if (!this.textures.exists('char_male'))
            this.load.image('char_male', 'assets/characters/char_male.png');
        if (!this.textures.exists('char_female'))
            this.load.image('char_female', 'assets/characters/char_female.png');

        const memCfg = GAME_CONFIG.ASSETS.objects.fridge_memory;
        if (memCfg && memCfg.url && !this.textures.exists(memCfg.key)) {
            this.load.image(memCfg.key, memCfg.url);
        }
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildFridgePhotoEasterEgg();
        this._createCharacters();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        this._tapHint = this.add.text(WIDTH / 2, HEIGHT * 0.44, '화면을 탭하여 시작하세요', {
            fontFamily:      'sans-serif',
            fontSize:        '21px',
            fill:            '#ffffff',
            stroke:          '#000000',
            strokeThickness: 5,
            backgroundColor: '#00000099',
            padding:         { x: 16, y: 10 },
        }).setOrigin(0.5).setDepth(55).setAlpha(0);

        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.time.delayedCall(350, () => this._showTapHint());

        this.input.once('pointerdown', () => {
            this.tweens.killTweensOf(this._tapHint);
            this._tapHint.setVisible(false);
            this.dialog.start(
                GAME_CONFIG.DIALOGUES.kitchen_intro,
                () => this._showMoveButton('거실로 이동 →', () => this._goToLiving()),
                (s) => this._onSpeakerChange(s)
            );
        });

        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _showTapHint() {
        this.tweens.add({ targets: this._tapHint, alpha: 1, duration: 350 });
        this.time.delayedCall(400, () => {
            this.tweens.add({
                targets: this._tapHint, alpha: 0.4,
                duration: 750, yoyo: true, repeat: -1,
            });
        });
    }

    _buildBackground() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_kitchen')
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

        let img = null;
        if (this.textures.exists(textureKey)) {
            const src     = this.textures.get(textureKey).getSourceImage();
            const targetH = Math.round(HEIGHT * 0.46);
            const scale   = targetH / src.height;
            img = this.add.image(0, 0, textureKey);
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

    _buildFridgePhotoEasterEgg() {
        const pos = GAME_CONFIG.POSITIONS.kitchen.fridge_photo;

        const zone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(8).setInteractive({ useHandCursor: true });

        zone.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            this._showPhotoModal();
        });

        if (GAME_CONFIG.DEBUG_MODE) {
            this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
                .setDepth(99).setStrokeStyle(2, 0x00ff00, 1).setFillStyle(0x00ff00, 0.15);
        }
    }

    // 대화 종료 후 좌상단에 이동 버튼 표시
    _showMoveButton(label, onTap) {
        const btn = this.add.text(18, 24, `🚶 ${label}`, {
            fontFamily:      'sans-serif',
            fontSize:        '17px',
            fill:            '#ffffff',
            backgroundColor: '#00000099',
            padding:         { x: 14, y: 9 },
            stroke:          '#000000',
            strokeThickness: 2,
        }).setDepth(60).setAlpha(0).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: btn, alpha: 1, duration: 400,
            onComplete: () => {
                this.tweens.add({
                    targets: btn, alpha: 0.6,
                    duration: 750, yoyo: true, repeat: -1,
                });
            },
        });

        btn.on('pointerover', () => {
            this.tweens.killTweensOf(btn);
            btn.setAlpha(1).setStyle({ fill: '#f1c40f' });
        });
        btn.on('pointerout', () => {
            btn.setStyle({ fill: '#ffffff' });
            this.tweens.add({ targets: btn, alpha: 0.6, duration: 750, yoyo: true, repeat: -1 });
        });
        btn.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            btn.disableInteractive();
            this.tweens.killTweensOf(btn);
            this.tweens.add({ targets: btn, alpha: 0, duration: 150,
                onComplete: () => { btn.destroy(); onTap(); }
            });
        });
    }

    _goToLiving() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LivingScene');
        });
    }

    _showPhotoModal() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const memCfg   = GAME_CONFIG.ASSETS.objects.fridge_memory;
        const hasPhoto = memCfg && this.textures.exists(memCfg.key);

        const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.90)
            .setDepth(90).setInteractive();

        let photo = null;
        if (hasPhoto) {
            photo = this.add.image(WIDTH / 2, HEIGHT / 2, memCfg.key).setDepth(91).setAlpha(0);
            const src    = this.textures.get(memCfg.key).getSourceImage();
            const scaleX = WIDTH  / src.width;
            const scaleY = HEIGHT / src.height;
            photo.setScale(Math.min(scaleX, scaleY));
            this.tweens.add({ targets: photo, alpha: 1, duration: 400 });
        } else {
            this.add.text(WIDTH / 2, HEIGHT / 2 - 20,
                '사진을 준비중이에요 ♡\n\nconfig.js > fridge_memory 에\n사진 경로를 입력하세요', {
                fontFamily: 'sans-serif', fontSize: '18px',
                fill: '#ffffff', align: 'center',
            }).setOrigin(0.5).setDepth(91);
        }

        const hint = this.add.text(WIDTH / 2, HEIGHT - 50, '화면을 탭하면 닫힙니다', {
            fontFamily: 'sans-serif', fontSize: '15px', fill: '#888888',
        }).setOrigin(0.5).setDepth(92);

        const closeTargets = photo ? [overlay, photo, hint] : [overlay, hint];
        overlay.once('pointerdown', () => {
            this.tweens.add({
                targets: closeTargets, alpha: 0, duration: 200,
                onComplete: () => closeTargets.forEach(o => o.destroy()),
            });
        });
    }

    _buildDebugUI() {
        const dbg = this.add.text(10, 10, '', {
            font: '16px monospace', fill: '#00ff00', backgroundColor: '#000000aa',
        }).setDepth(100);
        this.input.on('pointermove', ptr => {
            dbg.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
