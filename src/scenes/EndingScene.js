// =============================================================================
// EndingScene.js : 프로포즈 영상 재생 → 엔딩 텍스트
// Google Drive / 로컬 파일 / 더미 세 가지 모드를 자동으로 선택합니다
// =============================================================================
class EndingScene extends Phaser.Scene {
    constructor() { super('EndingScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.sound.stopAll();

        const cfg = GAME_CONFIG.ASSETS.video.propose;

        if (cfg.driveId) {
            // ① Google Drive 영상
            this._playGoogleDriveVideo(cfg.driveId);
        } else if (cfg.url && this.cache.video.exists(cfg.key)) {
            // ② 로컬 파일
            this._playLocalVideo(cfg.key);
        } else {
            // ③ 영상 없음 → 바로 엔딩 텍스트
            this._showEnding();
        }
    }

    // -------------------------------------------------------------------------
    // ① Google Drive iframe 오버레이
    // -------------------------------------------------------------------------
    _playGoogleDriveVideo(driveId) {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        // iframe 생성
        const iframe = document.createElement('iframe');
        iframe.src    = `https://drive.google.com/file/d/${driveId}/preview`;
        iframe.allow  = 'autoplay; fullscreen';
        iframe.style.cssText = [
            'position:fixed', 'top:0', 'left:0',
            'width:100%', 'height:100%',
            'border:none', 'z-index:9999', 'background:#000'
        ].join(';');
        document.body.appendChild(iframe);
        this._iframe = iframe;

        // 영상 종료 후 '엔딩으로 이동' 버튼
        // (Google Drive iframe은 종료 이벤트를 보내지 않으므로 수동 버튼 제공)
        const closeBtn = this._createCloseButton(WIDTH, HEIGHT);
        document.body.appendChild(closeBtn);
        this._closeBtn = closeBtn;

        closeBtn.addEventListener('click', () => this._closeIframeAndShowEnding());
    }

    _createCloseButton(WIDTH, HEIGHT) {
        const btn = document.createElement('button');
        btn.textContent = '영상 종료 →';
        btn.style.cssText = [
            'position:fixed',
            'bottom:30px',
            'right:30px',
            'z-index:10000',
            'background:rgba(0,0,0,0.7)',
            'color:#f1c40f',
            'border:2px solid #f1c40f',
            'border-radius:8px',
            'font-size:18px',
            'padding:10px 22px',
            'cursor:pointer',
            'font-family:sans-serif',
        ].join(';');
        return btn;
    }

    _closeIframeAndShowEnding() {
        if (this._iframe)   { this._iframe.remove();   this._iframe   = null; }
        if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; }

        // Phaser 캔버스 위에 엔딩 텍스트 표시
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        this._showEnding();
    }

    // -------------------------------------------------------------------------
    // ② 로컬 파일 재생 (Phaser video)
    // -------------------------------------------------------------------------
    _playLocalVideo(videoKey) {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        const video = this.add.video(WIDTH / 2, HEIGHT / 2, videoKey);

        this.time.delayedCall(100, () => {
            const scaleX = WIDTH  / video.width;
            const scaleY = HEIGHT / video.height;
            video.setScale(Math.max(scaleX, scaleY));
        });

        const hint = this.add.text(WIDTH / 2, HEIGHT / 2, '화면을 클릭하여 영상 재생', {
            fontFamily: 'sans-serif', fontSize: '36px',
            fill: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)',
            padding: { x: 24, y: 14 }
        }).setOrigin(0.5).setDepth(10);

        this.input.once('pointerdown', () => {
            hint.setVisible(false);
            video.play();
            if (!this.scale.isFullscreen) this.scale.startFullscreen();
        });

        video.on('complete', () => this._showEnding());
    }

    // -------------------------------------------------------------------------
    // 엔딩 텍스트
    // -------------------------------------------------------------------------
    _showEnding() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;

        const text = this.add.text(WIDTH / 2, HEIGHT / 2, 'Will you\nmarry me?', {
            fontFamily:  'serif',
            fontSize:    '42px',
            fill:        '#ffffff',
            fontStyle:   'italic',
            align:       'center',
            lineSpacing: 10,
            wordWrap:    { width: WIDTH - 60 },
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.tweens.add({
            targets: text, alpha: 1,
            duration: 3500, ease: 'Sine.easeIn'
        });
    }

    // 씬 종료 시 DOM 요소 정리
    shutdown() {
        if (this._iframe)   { this._iframe.remove();   this._iframe   = null; }
        if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; }
    }
}
