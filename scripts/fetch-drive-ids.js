/**
 * fetch-drive-ids.js
 * Google Drive "propose" 폴더의 파일 목록을 불러와
 * config.js에 넣을 driveId 를 자동으로 출력해주는 스크립트
 *
 * ============================================================
 * [사전 준비]
 * 1. Google Drive API 키 발급
 *    https://console.cloud.google.com
 *    → 새 프로젝트 → API 및 서비스 → 사용자 인증 정보
 *    → API 키 만들기 → Drive API 활성화
 *
 * 2. "propose" 폴더 공유 설정
 *    → 폴더 우클릭 → 링크 복사 → "링크가 있는 모든 사용자" 설정
 *    → 링크에서 폴더 ID 복사
 *      예) https://drive.google.com/drive/folders/[여기가_폴더ID]
 *
 * 3. 아래 FOLDER_ID 와 API_KEY 입력 후 실행
 *    node scripts/fetch-drive-ids.js
 * ============================================================
 *
 * [드라이브 폴더 파일 이름 규칙]
 * 파일 이름을 아래 규칙으로 맞춰주세요. 자동으로 config key와 매핑됩니다.
 *
 *  배경:    bg_room.png / bg_kitchen.png / bg_living.png
 *  캐릭터:  male_idle.png / male_cook.png / female_idle.png / couple_hug.png
 *  오브젝트: perfume.png / fridge_photo.png
 *  오디오:  bgm.mp3 / perfume_voice.mp3
 *  영상:    propose.mp4
 */

// .env 파일에서 자동으로 읽어옵니다
const env = Object.fromEntries(
    require('fs').readFileSync(require('path').join(__dirname, '../.env'), 'utf8')
        .split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=').map(s => s.trim()))
);
const FOLDER_ID = env.DRIVE_FOLDER_ID;
const API_KEY   = env.GOOGLE_API_KEY;

// ============================================================

if (!FOLDER_ID || !API_KEY) {
    console.error('❌ FOLDER_ID 와 API_KEY 를 입력해주세요.');
    process.exit(1);
}

const url = `https://www.googleapis.com/drive/v3/files`
    + `?q='${FOLDER_ID}'+in+parents+and+trashed=false`
    + `&fields=files(id,name,mimeType)`
    + `&pageSize=100`
    + `&key=${API_KEY}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error('❌ API 오류:', data.error.message);
            return;
        }

        const files = data.files;
        if (!files || files.length === 0) {
            console.log('⚠️  폴더에 파일이 없거나 공유 설정을 확인해주세요.');
            return;
        }

        console.log(`\n✅ "${FOLDER_ID}" 폴더에서 ${files.length}개 파일 발견\n`);
        console.log('='.repeat(60));
        console.log('// config.js 에 복사해서 붙여넣으세요');
        console.log('='.repeat(60));

        // 파일 이름 → config key 매핑 테이블
        const KEY_MAP = {
            'bg_room':        { section: 'backgrounds',  configKey: 'room'         },
            'bg_kitchen':     { section: 'backgrounds',  configKey: 'kitchen'      },
            'bg_living':      { section: 'backgrounds',  configKey: 'living'       },
            'male_idle':      { section: 'characters',   configKey: 'male_idle'    },
            'male_cook':      { section: 'characters',   configKey: 'male_cook'    },
            'female_idle':    { section: 'characters',   configKey: 'female_idle'  },
            'couple_hug':     { section: 'characters',   configKey: 'couple_hug'   },
            'perfume':        { section: 'objects',      configKey: 'perfume'      },
            'fridge_photo':   { section: 'objects',      configKey: 'fridge_photo' },
            'bgm':            { section: 'audio',        configKey: 'bgm'          },
            'perfume_voice':  { section: 'audio',        configKey: 'perfume_voice'},
            'propose':        { section: 'video',        configKey: 'propose'      },
        };

        const grouped = {};

        files.forEach(file => {
            const baseName = file.name.replace(/\.[^.]+$/, ''); // 확장자 제거
            const mapped   = KEY_MAP[baseName];

            if (!mapped) {
                console.log(`\n// ⚠️  매핑 없음 (파일명 확인): ${file.name}`);
                console.log(`//    ID: '${file.id}'`);
                return;
            }

            if (!grouped[mapped.section]) grouped[mapped.section] = [];
            grouped[mapped.section].push({ configKey: mapped.configKey, file });
        });

        Object.entries(grouped).forEach(([section, items]) => {
            console.log(`\n// --- ${section} ---`);
            items.forEach(({ configKey, file }) => {
                console.log(`${configKey}: {`);
                console.log(`    key:     '${file.name.replace(/\.[^.]+$/, '')}',`);
                console.log(`    url:     '',`);
                console.log(`    driveId: '${file.id}',`);
                console.log(`},`);
            });
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ 위 내용을 config.js 각 섹션에 붙여넣으세요');
    })
    .catch(err => console.error('❌ 네트워크 오류:', err.message));
