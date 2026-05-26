// =============================================================================
// KitchenScene.js : Stage 2 - 부엌
// 흐름: 씬 입장 → 대사 자동 시작 → 마지막 대사("야구볼래?") 후 LivingScene 이동
// 대사 내용 수정: config.js > DIALOGUES.kitchen_intro
// 이스터에그: 냉장고 사진 클릭 → 사진 확대 모달 (선택 사항)
// =============================================================================
class KitchenScene extends Phaser.Scene {
    constructor() { super('KitchenScene'); }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);

        this._buildBackground();
        this._buildCharacter();
        this._buildFridgePhotoEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        // 대사 자동 시작
        this.time.delayedCall(800, () => {
            this.dialog.start(GAME_CONFIG.DIALOGUES.kitchen_intro, () => {
                this._goToLiving();
            });
        });

        // 화면 클릭 시 대사 진행
        this.input.on('pointerdown', () => this.dialog.advance());

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------

    _buildBackground() {
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'bg_kitchen')
            .setDepth(0)
            .setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
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
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        spr.on('pointerover', () => {
            spr.setScale(0.32).setAlpha(1);
            this.tweens.getTweensOf(spr).forEach(t => t.pause());
        });
        spr.on('pointerout', () => {
            spr.setScale(0.28);
            this.tweens.getTweensOf(spr).forEach(t => t.resume());
        });
        spr.on('pointerdown', (ptr) => {
            ptr.event.stopPropagation();
            this._showPhotoModal();
        });
    }

    // -------------------------------------------------------------------------

    _goToLiving() {
        this.time.delayedCall(400, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
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
            fontFamily: 'sans-serif', fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setDepth(92);

        overlay.once('pointerdown', () => {
            this.tweens.add({
                targets: [overlay, photo, hint], alpha: 0, duration: 200,
                onComplete: () => { overlay.destroy(); photo.destroy(); hint.destroy(); }
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
