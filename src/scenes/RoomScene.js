// =============================================================================
// RoomScene.js : Stage 1 - 방
// 이벤트: 캐릭터 클릭 → 포옹 장면 + 대사
// 이스터에그: 향수 클릭 → 음성 재생 + 대사
// =============================================================================
class RoomScene extends Phaser.Scene {
    constructor() { super('RoomScene'); }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);
        this.hugTriggered = false;

        this._buildBackground();
        this._buildCharacters();
        this._buildPerfumeEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------
    // 배경
    // -------------------------------------------------------------------------
    _buildBackground() {
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'bg_room')
            .setDepth(0)
            .setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    }

    // -------------------------------------------------------------------------
    // 캐릭터 (남자 + 여자 → 포옹)
    // -------------------------------------------------------------------------
    _buildCharacters() {
        const pos = GAME_CONFIG.POSITIONS.room;

        this.maleSpr = this.add.image(pos.male.x, pos.male.y, 'male_idle')
            .setDepth(10).setOrigin(0.5, 1)
            .setInteractive({ useHandCursor: true });

        this.femaleSpr = this.add.image(pos.female.x, pos.female.y, 'female_idle')
            .setDepth(10).setOrigin(0.5, 1)
            .setInteractive({ useHandCursor: true });

        this.hugSpr = this.add.image(pos.hug.x, pos.hug.y, 'couple_hug')
            .setDepth(10).setOrigin(0.5, 1)
            .setAlpha(0).setVisible(false);

        const onCharClick = () => this._triggerHug();

        [this.maleSpr, this.femaleSpr].forEach(spr => {
            spr.on('pointerdown', onCharClick);
            spr.on('pointerover', () => spr.setTint(0xddddff));
            spr.on('pointerout',  () => spr.clearTint());
        });
    }

    // -------------------------------------------------------------------------
    // 이스터에그 : 향수
    // -------------------------------------------------------------------------
    _buildPerfumeEasterEgg() {
        const pos = GAME_CONFIG.POSITIONS.room.perfume;

        this.perfumeSpr = this.add.image(pos.x, pos.y, 'perfume')
            .setDepth(15).setScale(0.5)
            .setInteractive({ useHandCursor: true });

        // 은은하게 반짝여서 힌트 제공
        this.tweens.add({
            targets: this.perfumeSpr,
            alpha: 0.55, duration: 1800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.perfumeSpr.on('pointerdown', () => this._triggerPerfume());
        this.perfumeSpr.on('pointerover', () => {
            this.perfumeSpr.setTint(0xffffaa);
            this.tweens.getTweensOf(this.perfumeSpr).forEach(t => t.pause());
            this.perfumeSpr.setAlpha(1);
        });
        this.perfumeSpr.on('pointerout', () => {
            this.perfumeSpr.clearTint();
            this.tweens.getTweensOf(this.perfumeSpr).forEach(t => t.resume());
        });
    }

    // -------------------------------------------------------------------------
    // 이벤트 핸들러
    // -------------------------------------------------------------------------
    _triggerHug() {
        if (this.hugTriggered || this.dialog.isActive) return;
        this.hugTriggered = true;

        this.maleSpr.disableInteractive();
        this.femaleSpr.disableInteractive();

        // 두 캐릭터 페이드 아웃
        this.tweens.add({
            targets: [this.maleSpr, this.femaleSpr],
            alpha: 0, duration: 350,
            onComplete: () => {
                this.maleSpr.setVisible(false);
                this.femaleSpr.setVisible(false);

                // 포옹 이미지 페이드 인
                this.hugSpr.setVisible(true);
                this.tweens.add({
                    targets: this.hugSpr,
                    alpha: 1, duration: 400,
                    onComplete: () => {
                        this.dialog.start(GAME_CONFIG.DIALOGUES.room_hug, () => {});
                    }
                });
            }
        });
    }

    _triggerPerfume() {
        if (this.dialog.isActive) return;

        // 음성 재생 (파일 있을 때만)
        const cfg = GAME_CONFIG.ASSETS.audio.perfume_voice;
        this._voiceSound = null;
        if (this.cache.audio.exists(cfg.key)) {
            this._voiceSound = this.sound.add(cfg.key, { volume: cfg.volume });
            this._voiceSound.play();
        }

        this.dialog.start(GAME_CONFIG.DIALOGUES.room_perfume, () => {
            if (this._voiceSound && this._voiceSound.isPlaying) {
                this._voiceSound.stop();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 디버그 UI
    // -------------------------------------------------------------------------
    _buildDebugUI() {
        this.debugText = this.add.text(10, 10, '', {
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa'
        }).setDepth(100);

        this.input.on('pointermove', (ptr) => {
            this.debugText.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
