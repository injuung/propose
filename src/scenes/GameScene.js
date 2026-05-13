// =============================================================================
// GameScene.js : 플레이어 이동 및 스테이지 진행 핵심 로직
// =============================================================================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.stageIndex  = data.stageIndex || 0;
        this.stage       = GAME_CONFIG.STAGES[this.stageIndex];
        this.canMove     = true;
        this.playerTween = null;
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this._playBGM();
        this._buildStage();
        this._buildTargetMarker();

        this.dialog = new DialogSystem(this);

        if (GAME_CONFIG.DEBUG_MODE) this._buildDebugUI();

        this.input.on('pointerdown', this._onPointerDown, this);
    }

    update() {
        if (GAME_CONFIG.DEBUG_MODE) {
            const { x, y } = this.input.activePointer;
            this.debugText.setText(`클릭: X ${Math.round(x)}, Y ${Math.round(y)}`);
        }
    }

    // --- Private ---

    _playBGM() {
        const { bgm } = GAME_CONFIG.ASSETS;
        if (this.stageIndex === 0 && this.cache.audio.exists(bgm.key) && !this.sound.get(bgm.key)) {
            this.sound.add(bgm.key, { loop: true, volume: bgm.volume }).play();
        }
    }

    _buildStage() {
        const cx = GAME_CONFIG.WIDTH / 2;
        const cy = GAME_CONFIG.HEIGHT / 2;
        const { base, overlay, startPos } = this.stage;
        const { player } = GAME_CONFIG.ASSETS;

        this.add.image(cx, cy, base.key).setDepth(0);

        this.player = this.add.image(startPos.x, startPos.y, player.key)
            .setDepth(10)
            .setScale(player.scale)
            .setOrigin(0.5, 1);

        this.add.image(cx, cy, overlay.key).setDepth(20);
    }

    _buildTargetMarker() {
        const { x, y } = this.stage.targetPos;
        this.targetMarker = this.add.circle(x, y, 30, 0xf1c40f, 0.5).setDepth(1);
        this.tweens.add({
            targets: this.targetMarker,
            alpha: 0.1, scale: 1.5,
            duration: 1000, yoyo: true, repeat: -1
        });
    }

    _buildDebugUI() {
        const { targetPos, id } = this.stage;
        this.debugText = this.add.text(10, 10, '', {
            font: '20px Arial', fill: '#00ff00', backgroundColor: '#000000'
        }).setDepth(100);
        this.add.text(10, 40, `스테이지 ${id} / 목표: X ${targetPos.x}, Y ${targetPos.y}`, {
            font: '20px Arial', fill: '#ffffff', backgroundColor: '#000000'
        }).setDepth(100);
    }

    _onPointerDown(pointer) {
        if (this.dialog.isActive) {
            this.dialog.advance();
            return;
        }
        if (this.canMove) this._movePlayerTo(pointer.x, pointer.y);
    }

    _movePlayerTo(x, y) {
        if (this.playerTween) this.playerTween.stop();

        this.player.setFlipX(x < this.player.x);

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
        this.playerTween = this.tweens.add({
            targets: this.player,
            x, y,
            duration: (dist / GAME_CONFIG.PLAYER_SPEED) * 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => this._checkTargetReached()
        });
    }

    _checkTargetReached() {
        const { x, y } = this.stage.targetPos;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
        if (dist < 50) {
            this.canMove = false;
            this.targetMarker.setVisible(false);
            this.dialog.start(this.stage.dialogues, () => this._nextStage());
        }
    }

    _nextStage() {
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            const nextIndex = this.stageIndex + 1;
            if (nextIndex < GAME_CONFIG.STAGES.length) {
                this.scene.start('GameScene', { stageIndex: nextIndex });
            } else {
                this.scene.start('VideoScene');
            }
        });
    }
}
