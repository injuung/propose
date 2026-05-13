// =============================================================================
// KitchenScene.js : Stage 2 - 부엌
// 이벤트: 냄비(핫스팟) 클릭 → 요리 장면 + 대사
// 이스터에그: 냉장고 사진 클릭 → 사진 확대 모달
// =============================================================================
class KitchenScene extends Phaser.Scene {
    constructor() { super('KitchenScene'); }

    create() {
        this.cameras.main.fadeIn(600, 0, 0, 0);
        this.cookingTriggered = false;

        this._buildBackground();
        this._buildPotHotspot();
        this._buildFridgePhotoEasterEgg();

        this.dialog = new DialogSystem(this);
        new NavigationUI(this);

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();
    }

    // -------------------------------------------------------------------------
    // 배경
    // -------------------------------------------------------------------------
    _buildBackground() {
        this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'bg_kitchen')
            .setDepth(0)
            .setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    }

    // -------------------------------------------------------------------------
    // 냄비 핫스팟 (클릭 가능 영역)
    // -------------------------------------------------------------------------
    _buildPotHotspot() {
        const pos = GAME_CONFIG.POSITIONS.kitchen;

        // 클릭 감지용 투명 존
        const potZone = this.add.zone(
            pos.pot_hotspot.x, pos.pot_hotspot.y,
            pos.pot_hotspot.w, pos.pot_hotspot.h
        ).setDepth(5).setInteractive({ useHandCursor: true });

        // 힌트 테두리 (반짝임)
        this.potHint = this.add.rectangle(
            pos.pot_hotspot.x, pos.pot_hotspot.y,
            pos.pot_hotspot.w, pos.pot_hotspot.h
        ).setDepth(5).setStrokeStyle(3, 0xf1c40f, 0.7).setFillStyle(0x000000, 0);

        this.tweens.add({
            targets: this.potHint, alpha: 0.15,
            duration: 1000, yoyo: true, repeat: -1
        });

        // 요리 장면 스프라이트 (처음엔 숨김)
        const cookPos = pos.male_cook;
        this.cookSpr = this.add.image(cookPos.x, cookPos.y, 'male_cook')
            .setDepth(10).setOrigin(0.5, 1)
            .setAlpha(0).setVisible(false);

        potZone.on('pointerdown', () => this._triggerCooking());
        potZone.on('pointerover', () => this.potHint.setStrokeStyle(3, 0xffffff, 1));
        potZone.on('pointerout',  () => this.potHint.setStrokeStyle(3, 0xf1c40f, 0.7));
    }

    // -------------------------------------------------------------------------
    // 이스터에그 : 냉장고 사진
    // -------------------------------------------------------------------------
    _buildFridgePhotoEasterEgg() {
        const pos = GAME_CONFIG.POSITIONS.kitchen.fridge_photo;

        this.fridgePhoto = this.add.image(pos.x, pos.y, 'fridge_photo')
            .setDepth(8).setScale(0.28)
            .setInteractive({ useHandCursor: true });

        // 살짝 반짝임
        this.tweens.add({
            targets: this.fridgePhoto,
            alpha: 0.65, duration: 2200,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.fridgePhoto.on('pointerdown', () => this._showPhotoModal());
        this.fridgePhoto.on('pointerover', () => {
            this.fridgePhoto.setScale(0.32).setAlpha(1).clearTint();
            this.tweens.getTweensOf(this.fridgePhoto).forEach(t => t.pause());
        });
        this.fridgePhoto.on('pointerout', () => {
            this.fridgePhoto.setScale(0.28);
            this.tweens.getTweensOf(this.fridgePhoto).forEach(t => t.resume());
        });
    }

    // -------------------------------------------------------------------------
    // 이벤트 핸들러
    // -------------------------------------------------------------------------
    _triggerCooking() {
        if (this.cookingTriggered || this.dialog.isActive) return;
        this.cookingTriggered = true;

        // 힌트 테두리 제거
        this.potHint.destroy();

        this.cookSpr.setVisible(true);
        this.tweens.add({
            targets: this.cookSpr, alpha: 1, duration: 450,
            onComplete: () => {
                this.dialog.start(GAME_CONFIG.DIALOGUES.kitchen_cook, () => {});
            }
        });
    }

    _showPhotoModal() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // 어두운 오버레이
        const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.82)
            .setDepth(90).setInteractive();

        // 사진 확대 (0에서 시작해 원본 크기로 튀어오름)
        const photo = this.add.image(WIDTH / 2, HEIGHT / 2, 'fridge_photo')
            .setDepth(91).setScale(0);

        this.tweens.add({
            targets: photo, scale: 1.1,
            duration: 320, ease: 'Back.easeOut'
        });

        // 닫기 안내
        const hint = this.add.text(WIDTH / 2, HEIGHT - 55, '화면을 클릭하면 닫힙니다', {
            fontFamily: 'sans-serif', fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setDepth(92);

        // 클릭 시 닫기
        overlay.once('pointerdown', () => {
            this.tweens.add({
                targets: [overlay, photo, hint], alpha: 0, duration: 200,
                onComplete: () => { overlay.destroy(); photo.destroy(); hint.destroy(); }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 디버그 UI
    // -------------------------------------------------------------------------
    _buildDebugUI() {
        const pos = GAME_CONFIG.POSITIONS.kitchen.pot_hotspot;

        // 핫스팟 시각화 (디버그용 빨간 테두리)
        this.add.rectangle(pos.x, pos.y, pos.w, pos.h)
            .setDepth(99).setStrokeStyle(2, 0xff0000, 1).setFillStyle(0xff0000, 0.1);

        this.debugText = this.add.text(10, 10, '', {
            font: '18px monospace', fill: '#00ff00', backgroundColor: '#000000aa'
        }).setDepth(100);
        this.input.on('pointermove', (ptr) => {
            this.debugText.setText(`X:${Math.round(ptr.x)}  Y:${Math.round(ptr.y)}`);
        });
    }
}
