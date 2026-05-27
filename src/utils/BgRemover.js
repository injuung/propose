// =============================================================================
// BgRemover.js
// 단색 배경 이미지를 픽셀 처리하여 투명 PNG로 변환합니다.
// 네 모서리에서 BFS(홍수 채우기)를 실행해 배경만 제거하고
// 캐릭터 내부의 유사색(흰 셔츠, 회색 머리카락 등)은 보호합니다.
// =============================================================================

/**
 * scene   : Phaser.Scene
 * srcKey  : 원본 텍스처 키
 * dstKey  : 결과 텍스처 키 (이미 존재하면 건너뜀)
 * tolerance : 배경색 허용 오차 0~255 (기본 40)
 *             너무 낮으면 회색 잔상, 너무 높으면 캐릭터가 잘림
 */
function removeBgFromTexture(scene, srcKey, dstKey, tolerance) {
    tolerance = (tolerance !== undefined) ? tolerance : GAME_CONFIG.BG_REMOVE_TOLERANCE;

    if (scene.textures.exists(dstKey)) return;   // 이미 처리됨 → 재사용
    if (!scene.textures.exists(srcKey))  return;   // 원본 없음

    const src = scene.textures.get(srcKey).getSourceImage();
    const W   = src.width;
    const H   = src.height;

    // 오프스크린 캔버스에 원본 이미지를 그립니다
    const offCanvas    = document.createElement('canvas');
    offCanvas.width    = W;
    offCanvas.height   = H;
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(src, 0, 0);

    const imgData = ctx.getImageData(0, 0, W, H);
    const data    = imgData.data;   // RGBA 배열

    // ── 배경색 샘플 (왼쪽 상단 코너) ──────────────────────────────────────
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    // ── 색상 거리 계산 ─────────────────────────────────────────────────────
    function dist(pixelIdx) {
        const dr = data[pixelIdx]     - bgR;
        const dg = data[pixelIdx + 1] - bgG;
        const db = data[pixelIdx + 2] - bgB;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    // ── BFS 홍수 채우기 ─────────────────────────────────────────────────────
    // 출발점 → 인접 픽셀로 퍼지되, 배경색 범위를 벗어나면 멈춥니다.
    const visited = new Uint8Array(W * H);
    const edgeT   = tolerance * 1.5;   // 경계 픽셀 판정 임계

    function floodFill(sx, sy) {
        const startIdx = sy * W + sx;
        if (visited[startIdx]) return;
        visited[startIdx] = 1;

        const queue = [startIdx];
        let   qi    = 0;

        while (qi < queue.length) {
            const p = queue[qi++];
            const i = p << 2;          // p * 4
            const d = dist(i);

            if (d >= edgeT) continue;  // 캐릭터 픽셀 → 확산 중지

            if (d < tolerance) {
                data[i + 3] = 0;       // 완전 투명
            } else {
                // 경계 픽셀: 부드러운 반투명 (안티앨리어싱 효과)
                const ratio = (d - tolerance) / (edgeT - tolerance);
                data[i + 3] = Math.round(ratio * data[i + 3]);
            }

            // 상하좌우 인접 픽셀 탐색
            const x = p % W;
            const y = (p / W) | 0;

            if (x > 0     && !visited[p - 1]) { visited[p - 1] = 1; queue.push(p - 1); }
            if (x < W - 1 && !visited[p + 1]) { visited[p + 1] = 1; queue.push(p + 1); }
            if (y > 0     && !visited[p - W]) { visited[p - W] = 1; queue.push(p - W); }
            if (y < H - 1 && !visited[p + W]) { visited[p + W] = 1; queue.push(p + W); }
        }
    }

    // 네 모서리에서 동시에 시작 → 배경 전체를 확실히 제거
    floodFill(0,     0    );
    floodFill(W - 1, 0    );
    floodFill(0,     H - 1);
    floodFill(W - 1, H - 1);

    // ── 결과를 새 Phaser 텍스처로 등록 ─────────────────────────────────────
    ctx.putImageData(imgData, 0, 0);
    scene.textures.addCanvas(dstKey, offCanvas);
}
