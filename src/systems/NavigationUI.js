// =============================================================================
// NavigationUI.js : 하단 씬 이동 버튼 ([방] [부엌] [거실])
// 모든 GameScene에서 new NavigationUI(this) 로 호출하여 사용합니다
// =============================================================================
class NavigationUI {

    static SCENES = ['RoomScene', 'KitchenScene', 'LivingScene'];
    static LABELS = ['방', '부엌', '거실'];

    constructor(scene) {
        this.scene = scene;
        this._build();
    }

    _build() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const currentScene = this.scene.scene.key;

        const btnCount  = NavigationUI.SCENES.length;
        const btnWidth  = 110;
        const btnGap    = 16;
        const totalW    = btnCount * btnWidth + (btnCount - 1) * btnGap;
        const startX    = (WIDTH - totalW) / 2 + btnWidth / 2;
        const y         = HEIGHT - 36;

        // 배경 바
        this.scene.add.rectangle(WIDTH / 2, y, totalW + 48, 56, 0x000000, 0.65)
            .setDepth(60)
            .setOrigin(0.5);

        NavigationUI.SCENES.forEach((sceneName, i) => {
            const isActive = sceneName === currentScene;
            const x = startX + i * (btnWidth + btnGap);

            const btn = this.scene.add.text(x, y, NavigationUI.LABELS[i], {
                fontSize:         '26px',
                fontFamily:       'sans-serif',
                fill:             isActive ? '#f1c40f' : '#888888',
                fontStyle:        isActive ? 'bold'   : 'normal',
                backgroundColor:  isActive ? '#2a2a2a' : 'transparent',
                padding:          { x: 18, y: 8 },
            }).setOrigin(0.5).setDepth(61);

            // 활성 씬은 아래에 밑줄 표시
            if (isActive) {
                this.scene.add.rectangle(x, y + 22, btnWidth - 20, 3, 0xf1c40f)
                    .setDepth(62);
            } else {
                btn.setInteractive({ useHandCursor: true });

                btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
                btn.on('pointerout',  () => btn.setStyle({ fill: '#888888' }));
                btn.on('pointerdown', () => {
                    btn.disableInteractive();
                    this.scene.cameras.main.fadeOut(350, 0, 0, 0);
                    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.scene.start(sceneName);
                    });
                });
            }
        });
    }
}
