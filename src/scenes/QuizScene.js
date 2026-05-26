// =============================================================================
// QuizScene.js : 게임 시작 전 퀴즈 화면
// config.js 의 GAME_CONFIG.QUIZ 에서 문제·보기·정답을 관리합니다
// =============================================================================
class QuizScene extends Phaser.Scene {
    constructor() { super('QuizScene'); }

    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const { question, choices, answer, wrong_msg } = GAME_CONFIG.QUIZ;

        this.cameras.main.setBackgroundColor('#0d0d1a');
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this._wrongText = null;
        this._shakeTarget = null;

        // 배경 장식선
        this._drawDeco(WIDTH, HEIGHT);

        // 소제목
        this.add.text(WIDTH / 2, HEIGHT * 0.18, '우리를 알고 있나요?', {
            fontFamily: 'serif',
            fontSize:   '26px',
            fill:       '#aaaacc',
            fontStyle:  'italic',
        }).setOrigin(0.5);

        // 메인 질문
        this.add.text(WIDTH / 2, HEIGHT * 0.32, question, {
            fontFamily: 'serif',
            fontSize:   '52px',
            fill:       '#ffffff',
            fontStyle:  'bold',
        }).setOrigin(0.5);

        // 구분선
        const line = this.add.graphics();
        line.lineStyle(1, 0x5555aa, 0.6);
        line.strokeRect(WIDTH / 2 - 180, HEIGHT * 0.42, 360, 0);

        // 보기 버튼 생성
        const startY   = HEIGHT * 0.50;
        const gapY     = 88;
        const btnW     = 520;
        const btnH     = 60;

        choices.forEach((text, i) => {
            this._createChoice(
                WIDTH / 2,
                startY + i * gapY,
                btnW, btnH,
                text,
                text === answer
            );
        });

        // 오답 메시지 (초기엔 숨김)
        this._wrongText = this.add.text(WIDTH / 2, HEIGHT * 0.90, wrong_msg, {
            fontFamily: 'sans-serif',
            fontSize:   '22px',
            fill:       '#ff6666',
        }).setOrigin(0.5).setAlpha(0);
    }

    // -------------------------------------------------------------------------

    _createChoice(cx, cy, w, h, label, isCorrect) {
        const halfW = w / 2;
        const halfH = h / 2;

        // 배경 박스
        const bg = this.add.graphics();
        bg.lineStyle(1.5, 0x5566aa, 1);
        bg.fillStyle(0x1a1a3a, 1);
        bg.fillRoundedRect(cx - halfW, cy - halfH, w, h, 12);
        bg.strokeRoundedRect(cx - halfW, cy - halfH, w, h, 12);

        // 텍스트
        const txt = this.add.text(cx, cy, label, {
            fontFamily: 'sans-serif',
            fontSize:   '24px',
            fill:       '#ddddff',
        }).setOrigin(0.5);

        // 클릭 히트존
        const zone = this.add.zone(cx, cy, w, h)
            .setInteractive({ useHandCursor: true });

        zone.on('pointerover', () => {
            bg.clear();
            bg.lineStyle(2, 0xaabbff, 1);
            bg.fillStyle(0x2a2a5a, 1);
            bg.fillRoundedRect(cx - halfW, cy - halfH, w, h, 12);
            bg.strokeRoundedRect(cx - halfW, cy - halfH, w, h, 12);
            txt.setStyle({ fill: '#ffffff' });
        });

        zone.on('pointerout', () => {
            bg.clear();
            bg.lineStyle(1.5, 0x5566aa, 1);
            bg.fillStyle(0x1a1a3a, 1);
            bg.fillRoundedRect(cx - halfW, cy - halfH, w, h, 12);
            bg.strokeRoundedRect(cx - halfW, cy - halfH, w, h, 12);
            txt.setStyle({ fill: '#ddddff' });
        });

        zone.on('pointerdown', () => {
            if (isCorrect) {
                this._onCorrect(bg, txt, cx, cy, halfW, halfH);
            } else {
                this._onWrong(bg, txt, cx, cy, halfW, halfH);
            }
        });
    }

    _onCorrect(bg, txt, cx, cy, hw, hh) {
        // 정답 강조
        bg.clear();
        bg.lineStyle(2, 0x44ff88, 1);
        bg.fillStyle(0x0a3020, 1);
        bg.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
        bg.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
        txt.setStyle({ fill: '#44ff88' });

        this.time.delayedCall(700, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('PreloadScene');
            });
        });
    }

    _onWrong(bg, txt, cx, cy, hw, hh) {
        // 오답 빨간 테두리
        bg.clear();
        bg.lineStyle(2, 0xff4444, 1);
        bg.fillStyle(0x2a0a0a, 1);
        bg.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
        bg.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
        txt.setStyle({ fill: '#ff6666' });

        // 흔들기 효과
        this.tweens.add({
            targets: txt,
            x:       { from: cx - 8, to: cx + 8 },
            duration: 60,
            yoyo:    true,
            repeat:  3,
            onComplete: () => { txt.x = cx; },
        });

        // 오답 메시지 표시
        this._wrongText.setAlpha(1);
        this.tweens.add({
            targets:  this._wrongText,
            alpha:    0,
            delay:    1200,
            duration: 600,
        });

        // 0.8초 후 버튼 원상복구
        this.time.delayedCall(800, () => {
            bg.clear();
            bg.lineStyle(1.5, 0x5566aa, 1);
            bg.fillStyle(0x1a1a3a, 1);
            bg.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
            bg.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 12);
            txt.setStyle({ fill: '#ddddff' });
        });
    }

    _drawDeco(W, H) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x333366, 0.5);
        // 상단 장식
        g.strokeRect(40, 30, W - 80, 2);
        // 하단 장식
        g.strokeRect(40, H - 32, W - 80, 2);
        // 모서리 포인트
        [[40, 30], [W - 40, 30], [40, H - 32], [W - 40, H - 32]].forEach(([x, y]) => {
            g.fillStyle(0x5566aa, 1);
            g.fillRect(x - 3, y - 3, 6, 6);
        });
    }
}
