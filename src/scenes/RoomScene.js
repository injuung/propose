// =============================================================================
// RoomScene.js : Stage 1 - 침실
// 흐름: 씬 입장 → 탭 힌트 표시 → 대사 시작 → "이제 밥먹으러 가자." 후 KitchenScene 이동
// 대사 수정: config.js > DIALOGUES.room_intro
// =============================================================================
class RoomScene extends Phaser.Scene {
    constructor() { super('RoomScene'); }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // 배경 (어두운 이미지 위에 밝기 보정 오버레이 추가)
        this._buildBackground();

        // 캐릭터 (스프라이트 있을 때만)
        this._buildCharacters();
        this._buildPerfumeEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // ── 탭 힌트 오버레이 ──────────────────────────────────────
        this._tapHint = this.add.text(WIDTH / 2, HEIGHT * 0.44, '화면을 탭하여 시작하세요', {
            fontFamily: 'sans-serif',
            fontSize:   '32px',
            fill:       '#ffffff',
            stroke:     '#000000',
            strokeThickness: 6,
            backgroundColor: '#00000088',
            padding:    { x: 24, y: 14 },
        }).setOrigin(0.5).setDepth(55).setAlpha(0);

        // 페이드인 후 힌트 표시
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            // 힌트 텍스트 페이드인
            this.tweens.add({
                targets:  this._tapHint,
                alpha:    1,
                duration: 400,
            });
            // 힌트 깜빡임
            this.tweens.add({
                targets:  this._tapHint,
                alpha:    0.4,
                duration: 800,
                yoyo:     true,
                repeat:   -1,
                delay:    500,
            });
        });

        // 화면 탭 시 → 힌트 제거 후 대사 시작
        this.input.once('pointerdown', () => {
            this.tweens.killTweensOf(this._tapHint);
            this._tapHint.destroy();
            this.dialog.start(GAME_CONFIG.DIALOGUES.room_intro, () => {
                this._goToKitchen();
            });
        });

        // 이후 탭 → 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_room')
            .setDepth(0)
            .setDisplaySize(WIDTH, HEIGHT);

        // 어두운 배경 보정: 살짝 밝히는 흰 오버레이
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0.08)
            .setDepth(1);
    }

    _buildCharacters() {
        const pos = GAME_CONFIG.POSITIONS.room;
        if (this.textures.exists('male_idle')) {
            this.add.image(pos.male.x, pos.male.y, 'male_idle')
                .setDepth(10).setOrigin(0.5, 1);
        }
        if (this.textures.exists('female_idle')) {
            this.add.image(pos.female.x, pos.female.y, 'female_idle')
                .setDepth(10).setOrigin(0.5, 1);
        }
    }

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
            this.dialog.start(GAME_CONFIG.DIALOGUES.room_perfume, () => {
                if (voice && voice.isPlaying) voice.stop();
            });
        });
    }

    // -------------------------------------------------------------------------

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
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa',
        }).setDepth(100);
        this.input.on('pointermove', ptr => {
            dbg.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
