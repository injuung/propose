// =============================================================================
// NavigationUI.js : 하단 씬 이동 바 — 갤럭시 S24 세로(450×940) 기준
// =============================================================================
class NavigationUI {

    static SCENES = ['RoomScene', 'KitchenScene', 'LivingScene'];
    static LABELS = ['침실', '부엌', '거실'];

    constructor(scene) {
        this.scene = scene;
        this._build();
    }

    _build() {
        const { WIDTH, HEIGHT, UI } = GAME_CONFIG;
        const currentScene = this.scene.scene.key;
        const navH     = UI.NAV_BAR.HEIGHT;
        const navPad   = UI.NAV_BAR.BOTTOM_PAD;
        const y        = HEIGHT - navPad - navH / 2;
        const fontSize = Math.round(Math.max(16, Math.min(22, WIDTH * 0.048)));

        const btnCount = NavigationUI.SCENES.length;
        const btnWidth = (WIDTH - 16) / btnCount - 10;
        const gapX     = 10;
        const totalW   = btnCount * btnWidth + (btnCount - 1) * gapX;
        const startX   = (WIDTH - totalW) / 2 + btnWidth / 2;

        this.scene.add.rectangle(WIDTH / 2, y, WIDTH, navH, 0x000000, 0.80)
            .setDepth(60);

        NavigationUI.SCENES.forEach((sceneName, i) => {
            const isActive = sceneName === currentScene;
            const x = startX + i * (btnWidth + gapX);

            const btn = this.scene.add.text(x, y, NavigationUI.LABELS[i], {
                fontSize:        `${fontSize}px`,
                fontFamily:      'sans-serif',
                fill:            isActive ? '#f1c40f' : '#888888',
                fontStyle:       isActive ? 'bold'   : 'normal',
            }).setOrigin(0.5).setDepth(61);

            if (isActive) {
                this.scene.add.rectangle(x, y + navH / 2 - 10, btnWidth - 10, 3, 0xf1c40f)
                    .setDepth(62);
            } else {
                btn.setInteractive({ useHandCursor: true });
                btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
                btn.on('pointerout',  () => btn.setStyle({ fill: '#888888' }));
                btn.on('pointerdown', () => {
                    btn.disableInteractive();
                    this.scene.cameras.main.fadeOut(300, 0, 0, 0);
                    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.scene.start(sceneName);
                    });
                });
            }
        });
    }
}
