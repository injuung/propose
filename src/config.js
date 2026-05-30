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
            { text: "자기야, 할 말이 있어❤️", speaker: 'male' },
            { text: "이 방에서 매일 아침 같이 눈뜨면서 행복하게 하루를 시작하고, 고단했던 하루 끝에는 서로 꼭 안아주면서 행복하게 마무리할 수 있게 내가 노력할게. 언제나 우리 그렇게 같이 살자.", speaker: 'male' },
            { text: "와... 고마워. 그렇게 말해주니까 매일 하루의 시작이랑 끝이 다 든든하겠다. 우리 진짜 예쁘게 잘 살자.", speaker: 'female' },
            { text: "당연하지. 아침에 눈뜨자마자 매일 꼭 안아주면서 깨우는 것부터 매일매일 노력할 거야.", speaker: 'male' },
            { text: "어머, 나 잠투정 엄청 심한데 다 감당할 수 있겠어?", speaker: 'female' },
            { text: "응, 그게 뭐 어때. 나한테는 그저 귀엽기만 한데. 평생 다 받아줄 테니까 걱정 마.", speaker: 'male' },
            { text: "치... 말은 잘해요. 그래도 진짜 벌써 든든한 남편 같아서 좋다.", speaker: 'female' },
            { text: "그러니까 나만 믿고 따라와. 근데... 방 밖에서 무슨 맛있는 냄새 안 나? 완전 맛있는 로티세리 치킨 냄새인데?", speaker: 'male' },
            { text: "어? 진짜네? 맛있는 냄새 솔솔 난다. 배고프다, 얼른 부엌으로 가보자!", speaker: 'female' }
        ],

        // Stage 2 (부엌) — 마지막 줄 후 거실 이동
        kitchen_intro: [
            { text: "우와, 로티세리 치킨 진짜 맛있겠다! 자기야, 이 로티세리처럼 자기가 먹고 싶은 요리는 내가 언제든 맛있게 요리해 줄 거야.", speaker: 'male' },
            { text: "행복한 날에는 맛있는 음식 먹으면서 더 많이 웃고, 슬프거나 다투는 날이 있더라도 내가 만든 안주에 가볍게 한잔하면서 다 대화로 풀어낼 수 있게 노력할게. 음식을 핑계 삼아서 우리 늘 대화로 풀자.", speaker: 'male' },
            { text: "좋지! 자기 말처럼 행복하거나 슬프거나 어떠한 일이 있어도 맛있는 거 먹으면서 항상 대화로 풀자.", speaker: 'female' },
            { text: "응, 그렇게 우리 서로 양보하고 노력하면서 매일매일 행복하게 살자. 언제나 맛있는 거 많이 먹으면서!", speaker: 'male' },
            { text: "당연하지! 우리 서운한 거 절대 쌓아두지 말고 늘 대화 많이 하자. 내가 맛있게 먹고 설거지는 책임질게!", speaker: 'female' },
            { text: "응, 언제나 내가 먼저 손 내밀고 노력할게. 아, 맞다! 오늘 중요한 야구 경기 있지 않아? 얼른 거실 넘어가서 보자.", speaker: 'male' },
            { text: "앗, 맞다 오늘 경기 있지! 얼른 TV 켜자, 거실로 가자!", speaker: 'female' }
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
