// =============================================================================
// AssetFallback.js : 에셋 로드 실패 시 색상 블록으로 자동 대체
// 실제 에셋이 없어도 게임 전체 로직을 테스트할 수 있습니다
// =============================================================================
class AssetFallback {

    // 키 → { color, w, h, label } 매핑
    static FALLBACKS = {
        bg_room:    { color: 0x4a3728, w: 1280, h: 720, label: '방 배경'        },
        bg_kitchen: { color: 0x3a4a3a, w: 1280, h: 720, label: '부엌 배경'      },
        bg_living:  { color: 0x2a3a4a, w: 1280, h: 720, label: '거실 배경'      },

        male_idle:   { color: 0x3498db, w: 120, h: 240, label: '남자'           },
        male_cook:   { color: 0x2980b9, w: 140, h: 240, label: '남자(요리중)'   },
        female_idle: { color: 0xe91e8c, w: 110, h: 230, label: '여자'           },
        couple_hug:  { color: 0x9b59b6, w: 240, h: 250, label: '포옹'          },

        perfume:      { color: 0xf39c12, w:  60, h:  90, label: '향수'          },
        fridge_photo: { color: 0xecf0f1, w: 100, h:  80, label: '사진'          },
    };

    constructor(scene) {
        this.scene = scene;
    }

    generate(fileObj) {
        if (this.scene.textures.exists(fileObj.key)) return;

        const def = AssetFallback.FALLBACKS[fileObj.key];
        if (!def) return;

        const g = this.scene.make.graphics({ add: false });
        g.fillStyle(def.color, 1);
        g.fillRect(0, 0, def.w, def.h);

        // 배경 에셋이면 중앙에 라벨 렌더링 (디버그용)
        if (def.w >= 1280) {
            g.fillStyle(0x000000, 0.35);
            g.fillRect(0, 0, def.w, def.h);
        }

        g.generateTexture(fileObj.key, def.w, def.h);
        g.destroy();

        console.warn(`[AssetFallback] '${fileObj.key}' 대체 생성 완료 (${def.label})`);
    }
}
