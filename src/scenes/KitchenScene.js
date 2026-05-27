// =============================================================================
// KitchenScene.js : Stage 2 - 부엌
// 흐름: 씬 입장 → 탭 힌트 → 대사 → "야구볼래?" 후 LivingScene 이동
// 대사 수정: config.js > DIALOGUES.kitchen_intro
// =============================================================================
class KitchenScene extends Phaser.Scene {
    constructor() { super('KitchenScene'); }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        this._buildBackground();
        this._buildCharacter();
        this._buildFridgePhotoEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // ── 탭 힌트 오버레이 ──────────────────────────────────────
        this._tapHint = this.add.text(WIDTH / 2, HEIGHT * 0.50, '화면을 탭하여 시작하세요', {
            fontFamily: 'sans-serif',
            fontSize:   '32px',
            fill:       '#ffffff',
            stroke:     '#000000',
            strokeThickness: 6,
            backgroundColor: '#00000088',
            padding:    { x: 24, y: 14 },
        }).setOrigin(0.5).setDepth(55).setAlpha(0);

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
            this.tweens.add({ targets: this._tapHint, alpha: 1, duration: 400 });
            this.tweens.add({
                targets: this._tapHint, alpha: 0.4,
                duration: 800, yoyo: true, repeat: -1, delay: 500,
            });
        });

        // 첫 탭 → 힌트 제거 후 대사 시작
        this.input.once('pointerdown', () => {
            this.tweens.killTweensOf(this._tapHint);
            this._tapHint.destroy();
            this.dialog.start(GAME_CONFIG.DIALOGUES.kitchen_intro, () => {
                this._goToLiving();
            });
        });

        // 이후 탭 → 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        this.add.image(WIDTH / 2, HEIGHT / 2, 'bg_kitchen')
            .setDepth(0)
            .setDisplaySize(WIDTH, HEIGHT);

        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xffffff, 0.08)
            .setDepth(1);
    }

    _buildCharacter() {
        if (!this.textures.exists('male_cook')) return;
        const pos = GAME_CONFIG.POSITIONS.kitchen.male_cook;
        this.add.image(pos.x, pos.y, 'male_cook')
            .setDepth(10).setOrigin(0.5, 1);
    }

    _buildFridgePhotoEasterEgg() {
        if (!this.textures.exists('fridge_photo')) return;

        const pos = GAME_CONFIG.POSITIONS.kitchen.fridge_photo;
        const spr = this.add.image(pos.x, pos.y, 'fridge_photo')
            .setDepth(8).setScale(0.28)
            .setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: spr, alpha: 0.65, duration: 2200,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        spr.on('pointerover', () => {
            spr.setScale(0.32).setAlpha(1);
            this.tweens.getTweensOf(spr).forEach(t => t.pause());
        });
        spr.on('pointerout', () => {
            spr.setScale(0.28);
            this.tweens.getTweensOf(spr).forEach(t => t.resume());
        });
        spr.on('pointerdown', (pointer, lx, ly, event) => {
            event.stopPropagation();
            this._showPhotoModal();
        });
    }

    // -------------------------------------------------------------------------

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

        const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.82)
            .setDepth(90).setInteractive();

        const photo = this.add.image(WIDTH / 2, HEIGHT / 2, 'fridge_photo')
            .setDepth(91).setScale(0);

        this.tweens.add({ targets: photo, scale: 1.1, duration: 320, ease: 'Back.easeOut' });

        const hint = this.add.text(WIDTH / 2, HEIGHT - 55, '화면을 클릭하면 닫힙니다', {
            fontFamily: 'sans-serif', fontSize: '20px', fill: '#aaaaaa',
        }).setOrigin(0.5).setDepth(92);

        overlay.once('pointerdown', () => {
            this.tweens.add({
                targets: [overlay, photo, hint], alpha: 0, duration: 200,
                onComplete: () => { overlay.destroy(); photo.destroy(); hint.destroy(); },
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
