// =============================================================================
// config.js : 게임의 모든 설정값, 경로, 대사를 관리합니다
// ★ 화면 크기는 실행 시 window.innerWidth/Height 로 자동 감지됩니다
// =============================================================================

// 실제 화면 크기를 먼저 읽어 둡니다
const _W = window.innerWidth;
const _H = window.innerHeight;

const GAME_CONFIG = {

    DEBUG_MODE: false,  // true: 클릭 좌표 및 핫스팟 시각화

    // 캐릭터 배경 자동 제거 허용 오차 (0 ~ 255)
    // 낮을수록 안전(잔상 가능), 높을수록 공격적(캐릭터 일부 소실 가능)
    BG_REMOVE_TOLERANCE: 40,

    // 실제 기기 뷰포트 크기 (갤럭시 S24·아이폰 등 어떤 폰이든 자동 맞춤)
    WIDTH:  _W,
    HEIGHT: _H,

    // =========================================================================
    // [UI 레이아웃] — 화면 크기에 따라 대화창·하단 네비 자동 조절
    // =========================================================================
    UI: {
        NAV_BAR: {
            HEIGHT:     Math.round(Math.max(56, Math.min(72, _H * 0.076))),
            BOTTOM_PAD: Math.round(Math.max(8,  _H * 0.012)),
        },
        DIALOG: {
            TYPE_DELAY_MS: 58,
            FONT_SIZE:     Math.round(Math.max(13, Math.min(16, _W * 0.034))),
            NAME_FONT_SIZE: Math.round(Math.max(10, Math.min(12, _W * 0.028))),
            LINE_SPACING:  3,
            BOX_HEIGHT:    Math.round(Math.max(96, Math.min(118, _H * 0.125))),
            GAP_ABOVE_NAV: 12,
        },
    },

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
            // ★ 동영상 설정 방법
            //   1. Google Drive 파일 공유 링크 예시:
            //      https://drive.google.com/file/d/[파일ID]/view
            //   2. [파일ID] 부분을 아래 driveId 에 붙여넣기
            //   예) driveId: '1A2B3C4D5E6F7G8H9I0J'
            propose: {
                key:     'propose_video',
                url:     '',
                driveId: '',   // ← 여기에 Google Drive 파일 ID 입력
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
    // ★ choices 의 imageUrl : 각 항목 이미지 경로 (없으면 '' 로 비워두기)
    //   예) imageUrl: 'assets/quiz/jazzbar.png'
    // =========================================================================
    QUIZ: {
        question:  '우리의 사랑이 시작한 곳',
        choices: [
            { label: '재즈바',  imageKey: 'quiz_jazzbar',  imageUrl: 'assets/quiz/jazzbar.png'  },
            { label: '치킨집',  imageKey: 'quiz_chicken',  imageUrl: 'assets/quiz/chicken.png'  },
            { label: '와인샵',  imageKey: 'quiz_wineshop', imageUrl: 'assets/quiz/wineshop.png' },
        ],
        answer:    '재즈바',
        wrong_msg: '다시 생각해봐... 💭',
    },

    // =========================================================================
    // [대사 설정]
    // ★ 마지막 줄이 끝나면 자동으로 다음 씬으로 이동합니다
    // =========================================================================
    DIALOGUES: {

        // Stage 1 (침실) — 눈 뜨기 전 깨우기 → 밝아진 뒤 본 대화
        room_wake: [
            { text: "자기야... 일어나", speaker: 'male' },
        ],

        // Stage 1 (침실) — 마지막 줄 후 부엌 이동
        room_intro: [
            { text: "있잖아, 나 매일 아침 눈떴을 때 네 얼굴이 제일 먼저 보였으면 좋겠어. 평생 그러고 싶어.", speaker: 'male'   },
            { text: "나도. 그럼 매일 아침이 기대되겠다. 우리 진짜 예쁘게 살자, 응?", speaker: 'female' },
            { text: "당연하지. 근데 말만 하는 게 아니라, 진짜로 눈뜨자마자 꼭 안아주면서 깨워줄 거야.", speaker: 'male' },
            { text: "어머, 나 잠투정 엄청 심한데? 그래도 자신 있어?", speaker: 'female' },
            { text: "응, 그게 뭐 어때. 오히려 귀엽기만 하던데. 평생 다 받아줄게, 걱정 마.", speaker: 'male' },
            { text: "하... 진짜네. 벌써 준비 다 된 남편 같잖아.", speaker: 'female' },
            { text: "그러니까 믿고 따라와. 일단 오늘 아침은 내가 에스코트해줄게. 가자.", speaker: 'male' },
            { text: "에이, 성격 급하긴. 알았어, 가자!", speaker: 'female' },
        ],

        // Stage 2 (부엌) — 마지막 줄 후 거실 이동
        kitchen_intro: [
            { text: "나중에 우리 같이 살면, 네가 뭐 먹고 싶다 하면 그냥 해줄게. 그냥 같이 앉아서 밥 먹으면서 오늘 있었던 얘기 하고... 그런 게 좋더라고.", speaker: 'male'   },
            { text: "나도 그런 거 진짜 좋아. 그럼 난 맛있게 먹고 설거지 할게!", speaker: 'female' },
            { text: "살다 보면 서운할 때도 있겠지. 근데 그럴 때 혼자 담아두지 말고, 여기 앉아서 가볍게 한잔 하면서 얘기하자. 내가 먼저 말 걸게.", speaker: 'male' },
            { text: "그래. 솔직하게 얘기하면 금방 풀리잖아. 우리 그러자, 쌓아두지 말고.", speaker: 'female' },
            { text: "응. 아, 맞다 오늘 경기 있지 않아? 거실 가서 보자.", speaker: 'male' },
            { text: "맞다! 빨리 가자, TV 켜야겠다!", speaker: 'female' },
        ],

        // Stage 3 (거실) — TV 힌트
        living_hint: [
            { text: "경기 이미 시작했겠다. 저기 TV 좀 눌러봐줄래?", speaker: 'male'   },
            { text: "지금 몇 대 몇이려나~ 내가 켤게!", speaker: 'female' },
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
            // TV 화면 클릭 영역
            // 대화 종료 후 이 영역을 탭하면 동영상 재생
            // DEBUG_MODE: true 로 설정하면 영역이 빨간 선으로 표시됩니다
            tv_hotspot: {
                x: Math.round(_W * 0.50),
                y: Math.round(_H * 0.38),
                w: Math.round(_W * 0.88),   // 좌우 여백 6% 씩만 남기고 넓게
                h: Math.round(_H * 0.30),   // 높이도 충분히
            },
        },

    },

};
