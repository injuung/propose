// =============================================================================
// main.js : Phaser 게임 초기화
// =============================================================================
new Phaser.Game({
    type:            Phaser.AUTO,
    width:           GAME_CONFIG.WIDTH,
    height:          GAME_CONFIG.HEIGHT,
    parent:          document.body,
    backgroundColor: '#000000',
    scale: {
        mode:       Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        PreloadScene,
        RoomScene,
        KitchenScene,
        LivingScene,
        EndingScene,
    ],
});
