// =============================================================================
// config.js : 게임의 모든 설정값, 경로, 대사를 관리합니다
// ★ 화면 크기는 실행 시 window.innerWidth/Height 로 자동 감지됩니다
// =============================================================================

// 실제 화면 크기를 먼저 읽어 둡니다
const _W = window.innerWidth;
const _H = window.innerHeight;

const GAME_CONFIG = {

    DEBUG_MODE: false,  // true: 클릭 좌표 및 핫스팟 시각화

    // 실제 기기 뷰포트 크기 (갤럭시 S24·아이폰 등 어떤 폰이든 자동 맞춤)
    WIDTH:  _W,
    HEIGHT: _H,

    // =========================================================================
    // [에셋 설정]
    // ★ driveId 와 url 중 하나만 입력
    //   driveId : Google Drive 파일 ID  (url 은 '' 로 비워두기)
    //   url     : 로컬 파일 경로        (driveId 는 '' 로 비워두기)
    // =========================================================================
    ASSETS: {

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

        characters: {
            male_idle:   { key: 'char_male',   url: 'assets/characters/char_male.png',   driveId: '' },
            male_cook:   { key: 'char_male',   url: 'assets/characters/char_male.png',   driveId: '' },
            female_idle: { key: 'char_female', url: 'assets/characters/char_female.png', driveId: '' },
            couple_hug:  { key: 'char_female', url: 'assets/characters/char_female.png', driveId: '' },
        },

        objects: {
            perfume:      { key: 'perfume',      url: '', driveId: '' },
            fridge_photo: { key: 'fridge_photo', url: '', driveId: '' },

            // ★ 냉장고 사진 클릭 시 전체화면에 표시될 사진
            //   url 또는 driveId 중 하나를 채워 넣으세요
            fridge_memory: {
                key:     'fridge_memory',
                url:     '',        // 예: 'assets/photos/memory.png'
                driveId: '',        // 또는 Google Drive 파일 ID
            },
        },

        audio: {
            bgm: {
                key: 'bgm', url: '', driveId: '',
                volume: 0.3, loop: true,
            },
            perfume_voice: {
                key: 'perfume_voice', url: '', driveId: '',
                volume: 1.0, loop: false,
            },
        },

        video: {
            propose: {
                key:     'propose_video',
                url:     '',
                driveId: '',
            },
        },

    },

    // =========================================================================
    // [발화자 설정]
    // name : 대화창 상단에 표시되는 이름 (자유롭게 변경 가능)
    // key  : preload 에서 사용하는 텍스처 키 이름
    // =========================================================================
    SPEAKERS: {
        male:   { name: '인중', key: 'char_male' },
        female: { name: '정문', key: 'char_female' },
    },

    // =========================================================================
    // [퀴즈 설정]
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
    // ★ 마지막 줄이 끝나면 자동으로 다음 씬으로 이동합니다
    // =========================================================================
    DIALOGUES: {

        // Stage 1 (침실) — 마지막 줄 후 부엌 이동
        room_intro: [
            { text: "오늘 하루도 수고했어.",                    speaker: 'male'   },
            { text: "응... 네 옆에 누워있으니까 다 풀린다.",    speaker: 'female' },
            { text: "우리 이렇게 매일 같이 있을 수 있으면 좋겠다.", speaker: 'male' },
            { text: "나도.",                                    speaker: 'female' },
            { text: "이제 밥먹으러 가자.",                     speaker: 'male'   },
        ],

        // Stage 2 (부엌) — 마지막 줄 후 거실 이동
        kitchen_intro: [
            { text: "오늘은 내가 해줄게.",            speaker: 'male'   },
            { text: "진짜? 뭐 만들어줄 거야?",       speaker: 'female' },
            { text: "네가 좋아하는 거.",              speaker: 'male'   },
            { text: "맛있겠다. 역시 네가 최고야.",    speaker: 'female' },
            { text: "다 됐어. 어때?",                 speaker: 'male'   },
            { text: "야구볼래?",                      speaker: 'female' },
        ],

        // Stage 3 (거실) — TV 힌트
        living_hint: [
            { text: "저기... TV 한번 켜볼래?", speaker: 'female' },
        ],

        // 이스터에그: 향수
        room_perfume: [
            { text: "이 향수 냄새... 처음 만났을 때랑 똑같아.", speaker: 'female' },
        ],

    },

    // =========================================================================
    // [오브젝트 위치 설정] — 화면 비율(%) 기반으로 자동 계산
    // 배경 이미지가 바뀌면 아래 비율값을 조정하세요
    // =========================================================================
    POSITIONS: {

        room: {
            male:    { x: Math.round(_W * 0.36), y: Math.round(_H * 0.83) },
            female:  { x: Math.round(_W * 0.64), y: Math.round(_H * 0.83) },
            hug:     { x: Math.round(_W * 0.50), y: Math.round(_H * 0.83) },
            perfume: { x: Math.round(_W * 0.82), y: Math.round(_H * 0.51) },
        },

        kitchen: {
            male_cook: { x: Math.round(_W * 0.50), y: Math.round(_H * 0.83) },

            // 냉장고에 붙은 사진 클릭 영역 — 실제 이미지 위치에 맞게 조정
            // DEBUG_MODE: true 로 설정하면 좌표를 확인할 수 있습니다
            fridge_photo: {
                x: Math.round(_W * 0.13),
                y: Math.round(_H * 0.47),
                w: Math.round(_W * 0.13),
                h: Math.round(_H * 0.09),
            },

            pot_hotspot: {
                x: Math.round(_W * 0.44),
                y: Math.round(_H * 0.70),
                w: Math.round(_W * 0.44),
                h: Math.round(_H * 0.16),
            },
        },

        living: {
            // TV 화면 클릭 영역 — 실제 이미지 내 TV 위치에 맞게 조정
            // DEBUG_MODE: true 로 설정하면 좌표를 확인할 수 있습니다
            tv_hotspot: {
                x: Math.round(_W * 0.50),
                y: Math.round(_H * 0.30),
                w: Math.round(_W * 0.60),
                h: Math.round(_H * 0.18),
            },
        },

    },

};
