// =============================================================================
// config.js : 게임의 모든 설정값, 경로, 대사를 관리합니다
// 이 파일만 수정해도 대부분의 변경이 가능합니다
// =============================================================================
const GAME_CONFIG = {

    DEBUG_MODE: false,  // true: 클릭 좌표 및 핫스팟 시각화

    WIDTH:  1280,
    HEIGHT: 720,

    // =========================================================================
    // [에셋 설정]
    //
    // ★ 사용법: driveId 와 url 중 하나만 입력하면 됩니다
    //
    //   - driveId : Google Drive 파일 ID 입력 (url 은 '' 로 비워두기)
    //               파일 ID = 공유 링크의 /file/d/[여기]/view 부분
    //
    //   - url     : 로컬 파일 경로 입력 (driveId 는 '' 로 비워두기)
    //               예) 'assets/backgrounds/bg_room.png'
    //
    //   driveId 가 있으면 Google Drive가 우선 적용됩니다
    // =========================================================================
    ASSETS: {

        // --- 배경 이미지 ---
        // ※ 원본 사진 보관: assets/photos/rooms/
        backgrounds: {
            room: {
                key:     'bg_room',
                url:     'assets/backgrounds/bg_room.png',
                driveId: '',
            },
            kitchen: {
                key:     'bg_kitchen',
                url:     'assets/backgrounds/bg_kitchen.png',
                driveId: '',
            },
            living: {
                key:     'bg_living',
                url:     'assets/backgrounds/bg_living.png',
                driveId: '',
            },
        },

        // --- 캐릭터 스프라이트 ---
        // ※ 원본 사진 보관: assets/photos/characters/
        characters: {
            male_idle: {
                key:     'male_idle',
                url:     '',
                driveId: '',
            },
            male_cook: {
                key:     'male_cook',
                url:     '',
                driveId: '',
            },
            female_idle: {
                key:     'female_idle',
                url:     '',
                driveId: '',
            },
            couple_hug: {
                key:     'couple_hug',
                url:     '',
                driveId: '',
            },
        },

        // --- 인터랙션 오브젝트 이미지 ---
        objects: {
            perfume: {
                key:     'perfume',
                url:     '',
                driveId: '',          // [이스터에그] 방 향수
            },
            fridge_photo: {
                key:     'fridge_photo',
                url:     '',
                driveId: '',          // [이스터에그] 냉장고 위 사진
            },
        },

        // --- 오디오 ---
        // ※ Google Drive 오디오: 파일 크기가 작을수록 안정적으로 로드됩니다
        audio: {
            bgm: {
                key:     'bgm',
                url:     '',
                driveId: '',          // 배경음악 (mp3 권장)
                volume:  0.3,
                loop:    true,
            },
            perfume_voice: {
                key:     'perfume_voice',
                url:     '',
                driveId: '',          // [이스터에그] 향수 클릭 시 음성 (mp3 권장)
                volume:  1.0,
                loop:    false,
            },
        },

        // --- 영상 ---
        // ※ Google Drive 영상은 iframe으로 재생됩니다 (CORS 우회)
        video: {
            propose: {
                key:     'propose_video',
                url:     '',          // 로컬 경로 (미사용시 비워두기)
                driveId: '',          // Google Drive 파일 ID (권장)
            },
        },

    },

    // =========================================================================
    // [퀴즈 설정]
    // question : 화면에 표시될 질문
    // choices  : 보기 배열 (표시 순서 유지)
    // answer   : 정답 텍스트 (choices 중 하나와 정확히 일치해야 함)
    // wrong_msg: 오답 시 표시 메시지
    // =========================================================================
    QUIZ: {
        question:  '우리의 시작',
        choices: [
            '재즈바',
            '치킨집',
            '와인샵',
        ],
        answer:    '재즈바',
        wrong_msg: '다시 생각해봐... 💭',
    },

    // =========================================================================
    // [대사 설정]
    // ★ 대사 추가: 배열에 문자열을 넣으면 순서대로 표시됩니다
    // ★ 마지막 줄이 끝나면 자동으로 다음 씬으로 이동합니다
    // =========================================================================
    DIALOGUES: {

        // Stage 1 (침실) - 입장 대사
        // ※ 마지막 줄 이후 → 부엌 씬으로 자동 이동
        room_intro: [
            "오늘 하루도 수고했어.",
            "응... 네 옆에 누워있으니까 다 풀린다.",
            "우리 이렇게 매일 같이 있을 수 있으면 좋겠다.",
            "나도.",
            "이제 밥먹으러 가자.",
        ],

        // Stage 2 (부엌) - 요리 대사
        // ※ 마지막 줄 이후 → 거실 씬으로 자동 이동
        kitchen_intro: [
            "오늘은 내가 해줄게.",
            "진짜? 뭐 만들어줄 거야?",
            "네가 좋아하는 거.",
            "맛있겠다. 역시 네가 최고야.",
            "다 됐어. 어때?",
            "야구볼래?",
        ],

        // Stage 3 (거실) - 입장 시 TV 힌트 대사
        living_hint: [
            "저기... TV 한번 켜볼래?",
        ],

        // 이스터에그: 향수 클릭 (음성과 함께 표시됨)
        room_perfume: [
            "이 향수 냄새... 처음 만났을 때랑 똑같아.",
        ],

    },

    // =========================================================================
    // [오브젝트 위치 설정]
    // 배경 이미지가 바뀌면 아래 좌표를 조정하세요
    // x, y: 화면 좌표 (좌상단 기준, 1280×720)
    // w, h: 핫스팟(클릭 영역) 크기
    // =========================================================================
    POSITIONS: {

        room: {
            male:    { x: 380,  y: 560 },
            female:  { x: 780,  y: 560 },
            hug:     { x: 580,  y: 560 },
            perfume: { x: 980,  y: 340 },
        },

        kitchen: {
            male_cook:    { x: 460,  y: 520 },
            fridge_photo: { x: 1060, y: 390 },
            pot_hotspot:  { x: 440,  y: 480, w: 180, h: 130 },
        },

        living: {
            tv_hotspot: { x: 640, y: 270, w: 440, h: 270 },
        },

    },

};
