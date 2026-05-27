// =============================================================================
// RoomScene.js : Stage 1 - 침실
// 흐름: 씬 입장 → 탭 힌트 → 대사 (캐릭터 초상화 표시) → KitchenScene
// =============================================================================
class RoomScene extends Phaser.Scene {
    constructor() { super('RoomScene'); }

    preload() {
        if (!this.textures.exists('bg_room'))
            this.load.image('bg_room', 'assets/backgrounds/bg_room.png');
        if (!this.textures.exists('char_male'))
            this.load.image('char_male', 'assets/characters/char_male.png');
        if (!this.textures.exists('char_female'))
            this.load.image('char_female', 'assets/characters/char_female.png');
    }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildPerfumeEasterEgg();
        this._createPortraits();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        this._tapHint = this.add.text(WIDTH / 2, HEIGHT * 0.44, '화면을 탭하여 시작하세요', {
            fontFamily:      'sans-serif',
            fontSize:        '28px',
            fill:            '#ffffff',
            stroke:          '#000000',
            strokeThickness: 6,
            backgroundColor: '#00000099',
            padding:         { x: 20, y: 12 },
        }).setOrigin(0.5).setDepth(55).setAlpha(0);

        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.time.delayedCall(350, () => this._showTapHint());

        this.input.once('pointerdown', () => {
            this.tweens.killTweensOf(this._tapHint);
            this._tapHint.setVisible(false);
            this.dialog.start(
                GAME_CONFIG.DIALOGUES.room_intro,
                () => this._goToKitchen(),
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
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_room')
            .setDepth(0).setDisplaySize(WIDTH, HEIGHT);
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0.08)
            .setDepth(1);
    }

    // -------------------------------------------------------------------------
    // 캐릭터 초상화
    // -------------------------------------------------------------------------

    _createPortraits() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        // 대화창 위에 위치 (대화창 상단 = HEIGHT*0.79 - 92 = HEIGHT*0.69 부근)
        const portY = HEIGHT * 0.68;

        this._portFemale = this._buildPortrait(WIDTH * 0.18, portY, 'char_female', 'female');
        this._portMale   = this._buildPortrait(WIDTH * 0.82, portY, 'char_male',   'male');

        // 처음엔 모두 숨김
        this._portFemale.root.setAlpha(0);
        this._portMale.root.setAlpha(0);
    }

    _buildPortrait(x, y, textureKey, speakerKey) {
        const portSize  = 68;
        const nameColor = speakerKey === 'male' ? 0x88ccff : 0xffaabb;
        const cfg       = GAME_CONFIG.SPEAKERS[speakerKey];

        const root = this.add.container(x, y).setDepth(48);

        // 배경 + 테두리
        const bg = this.add.graphics();
        bg.fillStyle(0x111111, 0.82);
        bg.fillRoundedRect(-portSize / 2 - 4, -portSize / 2 - 4, portSize + 8, portSize + 8 + 26, 12);
        bg.lineStyle(2, nameColor, 0.85);
        bg.strokeRoundedRect(-portSize / 2 - 4, -portSize / 2 - 4, portSize + 8, portSize + 8 + 26, 12);

        // 캐릭터 이미지 (얼굴 중심 크롭)
        let img = null;
        if (this.textures.exists(textureKey)) {
            const src  = this.textures.get(textureKey).getSourceImage();
            const fH   = Math.floor(src.height * 0.40);   // 상위 40% = 머리+어깨
            const cSz  = Math.min(src.width, fH);
            const cX   = Math.floor((src.width - cSz) / 2);
            img = this.add.image(0, 0, textureKey);
            img.setCrop(cX, 0, cSz, cSz);
            img.setDisplaySize(portSize, portSize);
        }

        // 이름 라벨
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

    _buildPerfumeEasterEgg() {
        if (!this.textures.exists('perfume')) return;

        const pos = GAME_CONFIG.POSITIONS.room.perfume;
        const spr = this.add.image(pos.x, pos.y, 'perfume')
            .setDepth(15).setScale(0.5)
            .setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: spr, alpha: 0.55, duration: 1800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        spr.on('pointerover', () => {
            spr.setTint(0xffffaa).setAlpha(1);
            this.tweens.getTweensOf(spr).forEach(t => t.pause());
        });
        spr.on('pointerout', () => {
            spr.clearTint();
            this.tweens.getTweensOf(spr).forEach(t => t.resume());
        });
        spr.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            if (this.dialog.isActive) return;
            const cfg = GAME_CONFIG.ASSETS.audio.perfume_voice;
            let voice = null;
            if (this.cache.audio.exists(cfg.key)) {
                voice = this.sound.add(cfg.key, { volume: cfg.volume });
                voice.play();
            }
            this.dialog.start(
                GAME_CONFIG.DIALOGUES.room_perfume,
                () => { if (voice && voice.isPlaying) voice.stop(); },
                (s) => this._onSpeakerChange(s)
            );
        });
    }

    _goToKitchen() {
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('KitchenScene');
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
