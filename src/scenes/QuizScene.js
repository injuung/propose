// =============================================================================
// QuizScene.js : 게임 시작 전 퀴즈 — 이미지 카드 레이아웃
// config.js > GAME_CONFIG.QUIZ 에서 문제·보기·정답·이미지를 관리합니다
// =============================================================================
class QuizScene extends Phaser.Scene {
    constructor() { super('QuizScene'); }

    // ── 이미지 사전 로드 ─────────────────────────────────────────────────────
    preload() {
        GAME_CONFIG.QUIZ.choices.forEach(choice => {
            if (choice.imageUrl && !this.textures.exists(choice.imageKey)) {
                this.load.image(choice.imageKey, choice.imageUrl);
            }
        });
    }

    // ── 화면 구성 ─────────────────────────────────────────────────────────────
    create() {
        const { WIDTH, HEIGHT } = GAME_CONFIG;
        const { question, choices, answer, wrong_msg } = GAME_CONFIG.QUIZ;

        this.cameras.main.setBackgroundColor('#0d0d1a');
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this._wrongText = null;
        this._drawDeco(WIDTH, HEIGHT);

        // ── 소제목
        this.add.text(WIDTH / 2, HEIGHT * 0.10, '우리를 알고 있나요?', {
            fontFamily: 'serif',
            fontSize:   '16px',
            fill:       '#aaaacc',
            fontStyle:  'italic',
        }).setOrigin(0.5);

        // ── 메인 질문 (두 줄로 표현)
        this.add.text(WIDTH / 2, HEIGHT * 0.20, question, {
            fontFamily: 'serif',
            fontSize:   '30px',
            fill:       '#ffffff',
            fontStyle:  'bold',
            align:      'center',
            wordWrap:   { width: WIDTH - 60 },
        }).setOrigin(0.5);

        // ── 구분선
        const line = this.add.graphics();
        line.lineStyle(1, 0x5555aa, 0.5);
        line.lineBetween(WIDTH / 2 - 100, HEIGHT * 0.30, WIDTH / 2 + 100, HEIGHT * 0.30);

        // ── 보기 카드 (세로 배치)
        const cardW  = WIDTH - 48;
        const cardH  = 86;           // 이미지 공간 확보
        const startY = HEIGHT * 0.38;
        const gapY   = cardH + 16;

        choices.forEach((choice, i) => {
            this._createChoiceCard(
                WIDTH / 2,
                startY + i * gapY,
                cardW, cardH,
                choice,
                choice.label === answer
            );
        });

        // ── 오답 메시지
        this._wrongText = this.add.text(WIDTH / 2, HEIGHT * 0.90, wrong_msg, {
            fontFamily: 'sans-serif',
            fontSize:   '18px',
            fill:       '#ff6666',
        }).setOrigin(0.5).setAlpha(0);
    }

    // ── 보기 카드 생성 ────────────────────────────────────────────────────────
    _createChoiceCard(cx, cy, w, h, choice, isCorrect) {
        const hw = w / 2;
        const hh = h / 2;

        // 배경 박스
        const bg = this.add.graphics();
        this._drawCardBg(bg, cx, cy, hw, hh, 0x1a1a3a, 0x5566aa, 1.5);

        // ── 왼쪽 이미지 영역 (정사각형, 카드 높이 - 패딩)
        const imgSize  = h - 16;   // 이미지 크기 (패딩 8px 상하)
        const imgX     = cx - hw + 10 + imgSize / 2;   // 왼쪽 여백 + 이미지 중앙
        const imgAreaR = cx - hw + 10 + imgSize;       // 이미지 오른쪽 끝

        if (choice.imageKey && this.textures.exists(choice.imageKey)) {
            // ── 이미지 마스크용 라운드 배경
            const imgBg = this.add.graphics();
            imgBg.fillStyle(0x000000, 0.3);
            imgBg.fillRoundedRect(imgX - imgSize / 2, cy - hh + 8, imgSize, imgSize, 8);

            const img = this.add.image(imgX, cy, choice.imageKey);
            // 이미지 비율 유지하며 imgSize 에 맞춤
            const src    = this.textures.get(choice.imageKey).getSourceImage();
            const scale  = Math.min(imgSize / src.width, imgSize / src.height);
            img.setScale(scale).setOrigin(0.5);
        } else {
            // 이미지 없을 때 플레이스홀더 박스
            const ph = this.add.graphics();
            ph.fillStyle(0x2a2a4a, 1);
            ph.fillRoundedRect(imgX - imgSize / 2, cy - hh + 8, imgSize, imgSize, 8);
            this.add.text(imgX, cy, '?', {
                fontFamily: 'sans-serif',
                fontSize:   '22px',
                fill:       '#555577',
            }).setOrigin(0.5);
        }

        // ── 텍스트 (이미지 오른쪽 공간 중앙)
        const txtX = imgAreaR + (cx + hw - imgAreaR) / 2;
        const txt  = this.add.text(txtX, cy, choice.label, {
            fontFamily: 'sans-serif',
            fontSize:   '22px',
            fill:       '#ddddff',
        }).setOrigin(0.5);

        // ── 클릭 영역
        const zone = this.add.zone(cx, cy, w, h)
            .setInteractive({ useHandCursor: true });

        zone.on('pointerover', () => {
            this._drawCardBg(bg, cx, cy, hw, hh, 0x2a2a5a, 0xaabbff, 2);
            txt.setStyle({ fill: '#ffffff' });
        });
        zone.on('pointerout', () => {
            this._drawCardBg(bg, cx, cy, hw, hh, 0x1a1a3a, 0x5566aa, 1.5);
            txt.setStyle({ fill: '#ddddff' });
        });
        zone.on('pointerdown', () => {
            if (isCorrect) this._onCorrect(bg, txt, cx, cy, hw, hh);
            else           this._onWrong(bg, txt, cx, cy, hw, hh);
        });
    }

    // ── 카드 배경 렌더 헬퍼 ──────────────────────────────────────────────────
    _drawCardBg(g, cx, cy, hw, hh, fill, stroke, sw) {
        g.clear();
        g.lineStyle(sw, stroke, 1);
        g.fillStyle(fill, 1);
        g.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
        g.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
    }

    // ── 정답 처리 ─────────────────────────────────────────────────────────────
    _onCorrect(bg, txt, cx, cy, hw, hh) {
        bg.clear();
        bg.lineStyle(2, 0x44ff88, 1);
        bg.fillStyle(0x0a3020, 1);
        bg.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
        bg.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
        txt.setStyle({ fill: '#44ff88' });

        this.time.delayedCall(700, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('RoomScene');
            });
        });
    }

    // ── 오답 처리 ─────────────────────────────────────────────────────────────
    _onWrong(bg, txt, cx, cy, hw, hh) {
        bg.clear();
        bg.lineStyle(2, 0xff4444, 1);
        bg.fillStyle(0x2a0a0a, 1);
        bg.fillRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
        bg.strokeRoundedRect(cx - hw, cy - hh, hw * 2, hh * 2, 14);
        txt.setStyle({ fill: '#ff6666' });

        this.tweens.add({
            targets: txt, x: { from: txt.x - 8, to: txt.x + 8 },
            duration: 55, yoyo: true, repeat: 3,
            onComplete: () => { txt.x = cx + (hw - (txt.x - cx)); },
        });

        this._wrongText.setAlpha(1);
        this.tweens.add({
            targets: this._wrongText, alpha: 0, delay: 1200, duration: 600,
        });

        this.time.delayedCall(800, () => {
            this._drawCardBg(bg, cx, cy, hw, hh, 0x1a1a3a, 0x5566aa, 1.5);
            txt.setStyle({ fill: '#ddddff' });
        });
    }

    // ── 장식용 선 ─────────────────────────────────────────────────────────────
    _drawDeco(W, H) {
        const g = this.add.graphics();
        g.lineStyle(1, 0x333366, 0.5);
        g.lineBetween(30, 40, W - 30, 40);
        g.lineBetween(30, H - 40, W - 30, H - 40);
        [[30, 40], [W - 30, 40], [30, H - 40], [W - 30, H - 40]].forEach(([x, y]) => {
            g.fillStyle(0x5566aa, 1);
            g.fillRect(x - 3, y - 3, 6, 6);
        });
    }
}
