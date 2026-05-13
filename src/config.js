// =============================================================================
// config.js : 게임의 모든 설정값, 경로, 대사를 관리합니다
// 이 파일만 수정해도 대부분의 변경이 가능합니다
// =============================================================================
const GAME_CONFIG = {

    DEBUG_MODE: false,  // true: 클릭 좌표 및 핫스팟 시각화

    WIDTH:  1280,
    HEIGHT: 720,

    // =========================================================================
    // [에셋 경로 설정]
    // 파일을 아래 경로에 넣으면 자동으로 게임에 반영됩니다
    // 경로를 바꾸면 게임 전체에 자동 적용됩니다
    // =========================================================================
    ASSETS: {

        // --- 배경 이미지 ---
        // ※ 원본 실사 사진: assets/photos/rooms/ 에 보관
        // ※ 애니화 완성본:  아래 경로에 저장 후 게임 실행
        backgrounds: {
            room:    { key: 'bg_room',    url: 'assets/backgrounds/bg_room.png'    },  // 방 배경
            kitchen: { key: 'bg_kitchen', url: 'assets/backgrounds/bg_kitchen.png' },  // 부엌 배경
            living:  { key: 'bg_living',  url: 'assets/backgrounds/bg_living.png'  },  // 거실 배경
        },

        // --- 캐릭터 스프라이트 ---
        // ※ 원본 사진: assets/photos/characters/ 에 보관
        // ※ 애니화 완성본: 아래 경로에 저장 후 게임 실행
        characters: {
            male_idle:   { key: 'male_idle',   url: 'assets/characters/male_idle.png'   },  // 남자 기본 포즈
            male_cook:   { key: 'male_cook',   url: 'assets/characters/male_cook.png'   },  // 남자 요리 포즈
            female_idle: { key: 'female_idle', url: 'assets/characters/female_idle.png' },  // 여자 기본 포즈
            couple_hug:  { key: 'couple_hug',  url: 'assets/characters/couple_hug.png'  },  // 포옹 장면
        },

        // --- 인터랙션 오브젝트 이미지 ---
        objects: {
            perfume:      { key: 'perfume',      url: 'assets/objects/perfume.png'      },  // [이스터에그] 방 향수
            fridge_photo: { key: 'fridge_photo', url: 'assets/objects/fridge_photo.png' },  // [이스터에그] 냉장고 사진
        },

        // --- 오디오 ---
        // ※ assets/audio/ 에 파일을 넣어주세요
        audio: {
            bgm:           { key: 'bgm',           url: 'assets/audio/bgm.mp3',           volume: 0.3,  loop: true  },  // 배경음악
            perfume_voice: { key: 'perfume_voice', url: 'assets/audio/perfume_voice.mp3', volume: 1.0,  loop: false },  // [이스터에그] 향수 음성
        },

        // --- 영상 ---
        // 로컬 파일과 Google Drive 중 하나를 선택해서 사용하세요
        //
        // [Google Drive 사용법]
        // 1. Google Drive에 영상 업로드
        // 2. 파일 우클릭 → '링크 복사' → '링크가 있는 모든 사용자' 설정
        // 3. 공유 링크에서 파일 ID 복사
        //    예) https://drive.google.com/file/d/[여기가_파일ID]/view
        // 4. 아래 driveId 에 붙여넣기, url 은 '' 로 비워두기
        //
        // [로컬 파일 사용법]
        // driveId 를 '' 로 비우고 url 에 경로 입력
        video: {
            propose: {
                key:     'propose_video',
                url:     '',         // 로컬 파일 경로 (예: 'assets/video/propose.mp4')
                driveId: '',         // Google Drive 파일 ID (driveId 우선 적용)
            },
        },
    },

    // =========================================================================
    // [대사 설정]
    // 모든 멘트는 여기서 수정합니다
    // 배열에 문자열을 추가하면 대사가 늘어납니다
    // =========================================================================
    DIALOGUES: {

        // Stage 1 (방) - 포옹 후 남자 대사
        room_hug: [
            "...",
            "오늘 하루도 수고했어.",
            "네가 옆에 있어서 참 다행이야.",
        ],

        // Stage 1 (방) - 이스터에그 : 향수 클릭 시 (녹음본과 함께 표시됨)
        room_perfume: [
            "이 향수 냄새... 처음 만났을 때랑 똑같아.",
        ],

        // Stage 2 (부엌) - 냄비 클릭 후 요리 장면 대사
        kitchen_cook: [
            "잠깐만 기다려.",
            "오늘은 내가 해줄게.",
            "너한테 맛있는 거 해주고 싶어서.",
        ],

        // Stage 3 (거실) - TV 누르기 전 입장 힌트 대사
        living_hint: [
            "저기... TV 한번 켜볼래?",
        ],

    },

    // =========================================================================
    // [오브젝트 위치 설정]
    // 배경 이미지가 바뀌면 아래 좌표를 조정하세요
    // x, y: 화면 좌표 (좌상단 기준, 1280x720)
    // w, h: 핫스팟(클릭 영역) 크기
    // =========================================================================
    POSITIONS: {

        room: {
            male:    { x: 380,  y: 560 },   // 남자 캐릭터
            female:  { x: 780,  y: 560 },   // 여자 캐릭터
            hug:     { x: 580,  y: 560 },   // 포옹 장면 중심점
            perfume: { x: 980,  y: 340 },   // 향수 오브젝트
        },

        kitchen: {
            male_cook:    { x: 460,  y: 520 },               // 요리 중인 남자
            fridge_photo: { x: 1060, y: 390 },               // 냉장고 위 사진
            pot_hotspot:  { x: 440,  y: 480, w: 180, h: 130 }, // 냄비 클릭 영역
        },

        living: {
            tv_hotspot: { x: 640, y: 270, w: 440, h: 270 },  // TV 클릭 영역
        },

    },

};
