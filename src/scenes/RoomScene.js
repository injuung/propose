// =============================================================================
// RoomScene.js : Stage 1 - 침실
// 흐름: 씬 입장 → 대사 자동 시작 → 마지막 대사("이제 밥먹으러 가자.") 후 KitchenScene 이동
// 대사 내용 수정: config.js > DIALOGUES.room_intro
// =============================================================================
class RoomScene extends Phaser.Scene {
    constructor() { super('RoomScene'); }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);

        this._buildBackground();
        this._buildCharacters();
        this._buildPerfumeEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // 대사 자동 시작 (입장 직후 잠깐 여유 후)
        this.time.delayedCall(800, () => {
            this.dialog.start(GAME_CONFIG.DIALOGUES.room_intro, () => {
                this._goToKitchen();
            });
        });

        // 화면 클릭 시 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'bg_room')
            .setDepth(0)
            .setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    }

    _buildCharacters() {
        const pos = GAME_CONFIG.POSITIONS.room;

        // 스프라이트가 로드된 경우에만 표시
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
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        spr.on('pointerover', () => {
            spr.setTint(0xffffaa).setAlpha(1);
            this.tweens.getTweensOf(spr).forEach(t => t.pause());
        });
        spr.on('pointerout', () => {
            spr.clearTint();
            this.tweens.getTweensOf(spr).forEach(t => t.resume());
        });
        spr.on('pointerdown', (ptr) => {
            ptr.event.stopPropagation();
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
        this.time.delayedCall(400, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('KitchenScene');
            });
        });
    }

    _buildDebugUI() {
        const dbg = this.add.text(10, 10, '', {
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa'
        }).setDepth(100);
        this.input.on('pointermove', (ptr) => {
            dbg.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
