// =============================================================================
// RoomScene.js : Stage 1 - 침실
// 흐름: 씬 입장 → 탭 힌트 → 대사 (캐릭터 전신 표시) → 부엌 이동 버튼
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

        // 캐릭터 배경 자동 제거 (회색 → 투명)
        removeBgFromTexture(this, 'char_male',   'char_male_nobg');
        removeBgFromTexture(this, 'char_female', 'char_female_nobg');
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
                GAME_CONFIG.DIALOGUES.room_intro,
                () => this._showMoveButton('부엌으로 이동 →', () => this._goToKitchen()),
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
    // 캐릭터 전신 배치 (박스 없이 씬에 직접)
    // -------------------------------------------------------------------------

    _createCharacters() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        // 발 위치: 대화창(depth 50) 아래에 살짝 걸쳐 상반신만 보이는 VN 스타일
        const feetY = Math.round(HEIGHT * 0.87);

        this._charFemale = this._buildCharSprite(WIDTH * 0.22, feetY, 'char_female', 'female');
        this._charMale   = this._buildCharSprite(WIDTH * 0.78, feetY, 'char_male',   'male');

        // 처음엔 숨김
        this._charFemale.root.setAlpha(0);
        this._charMale.root.setAlpha(0);
    }

    _buildCharSprite(x, y, textureKey, speakerKey) {
        const { HEIGHT } = GAME_CONFIG;
        const cfg       = GAME_CONFIG.SPEAKERS[speakerKey];
        const nameColor = speakerKey === 'male' ? 0x88ccff : 0xffaabb;

        // depth 12: 배경보다 위, 대화창(50)보다 아래
        const root = this.add.container(x, y).setDepth(12);

        // 배경 제거된 텍스처가 있으면 우선 사용
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

        // 이름 라벨 — 머리 위에 작게
        const charH   = img ? img.displayHeight : 0;
        const hex     = '#' + nameColor.toString(16).padStart(6, '0');
        const label   = this.add.text(0, -(charH + 6), cfg ? cfg.name : speakerKey, {
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
                targets:  [this._charFemale.root, this._charMale.root],
                alpha:    0, duration: 400,
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

    _goToKitchen() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('KitchenScene');
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
