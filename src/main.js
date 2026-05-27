// =============================================================================
// main.js : Phaser 게임 초기화
// 화면 크기는 config.js 에서 window.innerWidth/Height 로 자동 감지됩니다
// =============================================================================
new Phaser.Game({
    type:            Phaser.AUTO,
    width:           GAME_CONFIG.WIDTH,
    height:          GAME_CONFIG.HEIGHT,
    parent:          document.body,
    backgroundColor: '#000000',
    scale: {
        // NONE: 이미 실제 화면 크기로 설정되어 있으므로 추가 스케일 불필요
        mode:       Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        QuizScene,
        PreloadScene,
        RoomScene,
        KitchenScene,
        LivingScene,
        EndingScene,
    ],
});
