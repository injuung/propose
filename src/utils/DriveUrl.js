// =============================================================================
// DriveUrl.js : Google Drive 파일 ID → 실제 URL 변환 유틸
//
// [Google Drive 파일 ID 찾는 법]
// 공유 링크: https://drive.google.com/file/d/[파일ID]/view
//                                              ↑ 이 부분
// 파일 우클릭 → '링크 복사' → '링크가 있는 모든 사용자' 설정 필수
// =============================================================================
class DriveUrl {

    // 이미지용 URL (Google CDN, CORS 허용)
    // 배경/캐릭터/오브젝트 이미지에 사용
    static image(id) {
        return `https://lh3.googleusercontent.com/d/${id}`;
    }

    // 오디오용 URL (직접 다운로드)
    // BGM, 음성 파일에 사용
    static audio(id) {
        return `https://drive.google.com/uc?export=download&id=${id}`;
    }

    // 영상 임베드 URL (iframe 재생용)
    // 영상 파일에 사용
    static videoEmbed(id) {
        return `https://drive.google.com/file/d/${id}/preview`;
    }

    // -------------------------------------------------------------------------
    // 에셋 설정 객체에서 URL을 자동 결정
    // driveId가 있으면 Google Drive URL, 없으면 로컬 url 사용
    // -------------------------------------------------------------------------
    static resolve(asset, type) {
        if (asset.driveId) {
            if (type === 'image') return DriveUrl.image(asset.driveId);
            if (type === 'audio') return DriveUrl.audio(asset.driveId);
        }
        return asset.url || null;
    }

    // 영상은 driveId 여부 확인만 함 (URL 생성은 EndingScene에서 처리)
    static hasVideo(asset) {
        return !!(asset.driveId || asset.url);
    }
}
