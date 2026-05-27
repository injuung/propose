// =============================================================================
// KitchenScene.js : Stage 2 - 부엌
// 흐름: 씬 입장 → 탭 힌트 → 대사 (캐릭터 초상화 표시) → LivingScene
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

        // 냉장고 클릭 시 표시할 사진 (config에 url 또는 driveId 설정 필요)
        const memCfg = GAME_CONFIG.ASSETS.objects.fridge_memory;
        if (memCfg && memCfg.url && !this.textures.exists(memCfg.key)) {
            this.load.image(memCfg.key, memCfg.url);
        }
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildFridgePhotoEasterEgg();
        this._createPortraits();

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
                () => this._goToLiving(),
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
    // 캐릭터 초상화
    // -------------------------------------------------------------------------

    _createPortraits() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const portY = HEIGHT * 0.63;

        this._portFemale = this._buildPortrait(WIDTH * 0.18, portY, 'char_female', 'female');
        this._portMale   = this._buildPortrait(WIDTH * 0.82, portY, 'char_male',   'male');

        this._portFemale.root.setAlpha(0);
        this._portMale.root.setAlpha(0);
    }

    _buildPortrait(x, y, textureKey, speakerKey) {
        const portSize  = 54;
        const nameColor = speakerKey === 'male' ? 0x88ccff : 0xffaabb;
        const cfg       = GAME_CONFIG.SPEAKERS[speakerKey];

        const root = this.add.container(x, y).setDepth(48);

        const bg = this.add.graphics();
        bg.fillStyle(0x111111, 0.82);
        bg.fillRoundedRect(-portSize / 2 - 3, -portSize / 2 - 3, portSize + 6, portSize + 6 + 22, 10);
        bg.lineStyle(2, nameColor, 0.85);
        bg.strokeRoundedRect(-portSize / 2 - 3, -portSize / 2 - 3, portSize + 6, portSize + 6 + 22, 10);

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
        const label = this.add.text(0, portSize / 2 + 12, cfg ? cfg.name : speakerKey, {
            fontFamily:      'sans-serif',
            fontSize:        '13px',
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

    _buildFridgePhotoEasterEgg() {
        const pos = GAME_CONFIG.POSITIONS.kitchen.fridge_photo;

        // 보이지 않는 클릭 영역만 생성 (라인·아이콘 없음)
        const zone = this.add.zone(pos.x, pos.y, pos.w, pos.h)
            .setDepth(8)
            .setInteractive({ useHandCursor: true });

        zone.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            this._showPhotoModal();
        });

        // DEBUG_MODE 에서만 영역 시각화
        if (GAME_CONFIG.DEBUG_MODE) {
            this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
                .setDepth(99).setStrokeStyle(2, 0x00ff00, 1).setFillStyle(0x00ff00, 0.15);
        }
    }

    _goToLiving() {
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('LivingScene');
            });
        });
    }

    _showPhotoModal() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const memCfg = GAME_CONFIG.ASSETS.objects.fridge_memory;
        const hasPhoto = memCfg && this.textures.exists(memCfg.key);

        // 어두운 배경
        const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.90)
            .setDepth(90).setInteractive();

        let photo = null;
        if (hasPhoto) {
            // 사용자가 제공한 사진 — 화면에 꽉 차게 표시
            photo = this.add.image(WIDTH / 2, HEIGHT / 2, memCfg.key).setDepth(91).setAlpha(0);
            const src    = this.textures.get(memCfg.key).getSourceImage();
            const scaleX = WIDTH  / src.width;
            const scaleY = HEIGHT / src.height;
            photo.setScale(Math.min(scaleX, scaleY));   // 비율 유지, 화면 안에 꽉 맞춤
            this.tweens.add({ targets: photo, alpha: 1, duration: 400 });
        } else {
            // 사진이 아직 없을 때 안내 텍스트
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
