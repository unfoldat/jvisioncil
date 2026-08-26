import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Sveltia CMS는 옵셔널 string 위젯을 비워두면 필드를 생략하지 않고 ''(빈 문자열)로
// 저장한다. z.string().url().optional()은 undefined만 통과시키고 ''은 그대로
// url() 검증에 넣어 "Invalid URL" 예외로 빌드가 죽는다 — ''을 undefined로 미리 바꾼다.
const optionalUrl = () => z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());

// 확정 결정 — 소식은 좋은비전 단독 게시판(협력기관 소식 안 씀). 예전에 있던
// publisher(발행 주체)·org(협력기관 참조)·url(외부 원문 주소) 필드는 전부 제거 —
// 전부 내부 상세 페이지로 고정된다.
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // 목록 최상단 고정 + [공지] 표시. 날짜 정렬 자체는 안 바꾼다(이전글/다음글은 pinned 무관하게 날짜순).
    pinned: z.boolean().default(false),
    // 2026-08-25 홈 소식 미리보기 — pinned와 완전히 독립된 별개 필드(상단고정은 소식
    // 목록 안에서의 정렬, showOnHome은 홈페이지 노출 여부로 서로 다른 목적).
    showOnHome: z.boolean().default(false),
    // 2026-08-19 작업지시서(오후) — "본문 첫 이미지를 카드 썸네일로 자동 재사용" 방식을
    // 폐지 — 본문에 이미지가 있으면 그 이미지가 카드와 본문에 중복으로 뜨는 문제가 있었다
    // (예: "변환테스트" 글). 대신 편집자가 직접 넣는 전용 thumbnail 필드를 둔다 — 카드
    // 목록에서만 쓰이고, 상세페이지 상단 배너는 계속 없다(본문 이미지는 본문 흐름 안에서
    // 몇 장이든 전부 그대로 보인다). 비어 있으면 로고를 기본 이미지로 표시.
    thumbnail: z.string().optional(),
    // 2026-08-19 접근성 감사 — 썸네일이 정보성 사진(예: 포스터·행사 현장)이면 alt=""
    // 고정은 스크린리더 사용자에게서 그 정보를 통째로 없앤다. leadership/instructors의
    // photoAlt와 동일 패턴 — 비워두면 프런트에서 alt=""(장식용, 카드가 이미 h3 제목으로
    // 글을 식별하므로 이 경우엔 문제없음)로 처리.
    thumbnailAlt: z.string().optional(),
    // 2026-08-18 카드 목록용 한 줄 요약 — 목업의 소식 카드엔 날짜·제목 아래 짧은
    // 요약 문장이 있었는데(예: "계절별로 떠나는 트레킹 프로그램의 세 번째 일정
    // 참가자를 모집합니다.") 이 프로젝트엔 그 필드가 아예 없어서 카드에 요약이
    // 안 보이고 있었다. 본문(body) 전체와는 별개, 비어 있으면 카드에서 생략.
    summary: z.string().optional(),
  }),
});

// network-orgs = 함께하는 기관(실제 외부 협력기관만) — 기관소개/홈의 MOU 협력기관
// 배너에 노출된다.
const networkOrgs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/network-orgs' }),
  schema: z.object({
    name: z.string(),
    url: optionalUrl(),
  }),
});

// sponsors = 후원기관: 후원안내 하위 섹션.
const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    name: z.string(),
    url: optionalUrl(),
  }),
});

// 2026-08-18 스키마 정정 — 이전 결정("title 필드 없음, {year}년 내역입니다로 자동생성")을
// 뒤집는다. title은 편집자가 직접 쓰는 필드다(자동생성 아님). year·file은 기존 그대로,
// body(본문)는 여전히 선택 필드. 법적 의무 문서(무보관 원칙의 유일한 예외).
const donationReports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/donation-reports' }),
  schema: z.object({
    // 2026-08-18 CMS 관리 화면(summary/slug 템플릿)에서 4자리 연도에 천 단위 쉼표가
    // 잘못 붙던 문제 수정 — Sveltia CMS는 widget:number의 value_type이 int/float일 때
    // 템플릿 렌더링 시 무조건 Intl.NumberFormat을 적용한다(끄는 옵션 없음, 번들 소스
    // 확인). config.yml에서 value_type: string으로 바꿔 이 분기를 우회했고, 여기서는
    // z.coerce.number()로 문자열("2026")·숫자(2026) 둘 다 안전하게 처리한다.
    year: z.coerce.number().int(),
    title: z.string(),
    file: z.string(),
  }),
});

// 확정 스키마 결정(2026-08-17) — 센터장·부센터장 = 파일형(고정 2명, 폴더형 금지).
// Sveltia CMS의 files: 컬렉션으로 CMS 화면에 항목 추가/삭제 버튼 자체가 없게 만든다
// (glob 로더 입장에서는 이 폴더에 파일이 director.md/deputy-director.md 두 개뿐인
// 평범한 폴더 컬렉션이지만, 실수로 3번째가 생기는 경로는 CMS 쪽에서 막혀 있다).
const leadership = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leadership' }),
  schema: z.object({
    role: z.string(),
    name: z.string(),
    photo: z.string(),
    // 2026-08-18 필수→선택 전환(작업지시서) — 편집자가 저장을 막히지 않고 나중에
    // 채울 수 있게 함. 비어 있으면 alt=""(장식용 처리)로 렌더링되는 것까지 프런트에서
    // 보장한다(각 페이지의 `?? ''` 처리 참고) — 대체텍스트 누락(alt 속성 자체가 빠지는
    // 것)과는 다르다.
    photoAlt: z.string().optional(),
    bio: z.array(z.string()).min(1),
    // object-position 값(예: "center 20%"). 비우면 페이지 쪽에서 기본값 적용.
    photoPos: z.string().optional(),
  }),
});

// 확정 스키마 결정(2026-08-17) — 메인갤러리는 소식과 분리된 별도 컬렉션.
// 노출 위치 체크박스(메인/소식/후원, 기본값 3개 다 체크) — 지금은 3곳이 완전히 같은
// 사진 목록을 쓰지만, 나중에 특정 위치만 다른 사진을 쓰고 싶어지면 코드 수정 없이
// 이 체크박스 해제만으로 처리된다.
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    photo: z.string(),
    // 2026-08-18 필수→선택 전환(작업지시서) — leadership.photoAlt와 동일 이유·처리.
    alt: z.string().optional(),
    showOn: z.array(z.enum(['home', 'news', 'donate'])).default(['home', 'news', 'donate']),
    // 2026-08-18 config.yml의 reorder:true가 CMS에서 드래그할 때 여기에 채워 넣는 값.
    // 없는 항목(아직 한 번도 드래그로 정렬 안 된 것)은 화면 쪽 정렬에서 맨 뒤로 취급.
    order: z.number().optional(),
  }),
});

// 확정 스키마 결정(2026-08-17) — 강사 프로필은 폴더형(가변 개수). 강사를 추가/삭제하면
// 강의 안내 페이지 카드가 그만큼 자동으로 늘고 준다.
// 2026-08-23 — 실제 강사 프로필 PDF(경력증명서 형식) 원본 구조로 스키마 확장. 기존
// bio(문자열 배열, 약력 한 줄씩)는 이 구조로 완전히 대체되어 제거 — 소개/학력/활동실적/
// 자격을 각각 별도 필드로 분리한다(src/skills의 content-structure-a11y 판단: 학력은
// 레코드 배열+열 비교 대상이라 table, 활동실적은 레코드 배열이지만 카드처럼 한 줄씩
// 완결 소비하니 list, 활동지역/요일은 반복 없는 라벨-값 1세트라 dl). 연락처·이메일은
// 개인정보라 스키마에 아예 안 만든다(사이트에 노출할 필드가 없어야 실수로도 안 들어감).
const instructors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/instructors' }),
  schema: z.object({
    name: z.string(),
    role: z.string(), // 소속/직함 한 줄 (예: "명지대학교 / 서울한영대학교 객원교수")
    photo: z.string(),
    // 2026-08-18 필수→선택 전환(작업지시서) — leadership.photoAlt와 동일 이유·처리.
    photoAlt: z.string().optional(),
    // object-position 값. 비우면 페이지 쪽에서 기본값 적용(리더 프로필과 동일 패턴).
    photoPos: z.string().optional(),
    intro: z.array(z.string()).optional(), // 강사 소개 — 문단마다 별도 <p>로 렌더링
    region: z.string().optional(), // 활동지역
    // 항목이 적고(6개 이하) 상호작용이 없는 나열이라 배열로 안 쪼갠다(스킬 원칙 6번) —
    // "월, 화, 수, 목, 금, 토 가능"처럼 자유 텍스트 한 줄 그대로.
    availableDays: z.string().optional(),
    // 레코드 배열 + 열 비교(학위 ↔ 학교) 소비 패턴이라 table로 렌더링된다.
    education: z
      .array(
        z.object({
          degree: z.string(),
          school: z.string(),
        }),
      )
      .optional(),
    // 레코드 배열이지만 카드처럼 한 줄씩 완결 소비(열 비교 없음) → list, label은 강조 표시.
    career: z
      .array(
        z.object({
          label: z.string(),
          detail: z.string(),
        }),
      )
      .optional(),
    certifications: z.array(z.string()).optional(), // 독립 항목 배열 → list(알약형 태그)
  }),
});

// 확정 스키마 결정(2026-08-17) — 기관 주소·대표전화·계좌번호 = 파일형(리더 프로필과 동일
// 이유: 기관에 하나뿐인 값이라 폴더형처럼 개수가 늘 이유가 없음). tel(전화 링크용 숫자만)은
// 저장하지 않고 phone에서 계산한다(src/lib/orgInfo.ts) — 편집자가 표시용 번호만 바꾸고
// tel: 링크를 깜빡 안 맞추는 사고를 원천 차단.
const orgInfo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/org-info' }),
  schema: z.object({
    address: z.string(),
    phone: z.string(),
    bankName: z.string(),
    accountNumber: z.string(),
    accountHolder: z.string(),
    // 2026-08-26 (test/home-notice-4) — 푸터에 하드코딩돼 있던 기관 이메일을
    // CMS에서 직접 수정 가능하게 필드로 뺀다. mailto: 링크로 안 쓰고 평문
    // 표시 전용이라 telHref 같은 파생 헬퍼가 필요 없다.
    orgEmail: z.string().default('jvisioncil@gmail.com'),
  }),
});

// 2026-08-18 Q&A 게시판 신설 — 폴더형(질문 개수가 계속 늘 수 있음, 강사 프로필과 동일
// 이유). section은 8개 값 고정(작업지시서 확정), order로 같은 section 안 순서를 매긴다.
// answer는 마크다운(표 포함)을 그대로 렌더링해야 해서 notices/donation-reports와 같은
// 관례대로 필드명을 "body"로 둔다 — Sveltia에서 위젯 라벨은 "답변(A)"으로 보이지만,
// 실제로는 파일 마크다운 본문에 매핑돼 astro:content의 render()가 자동으로 처리하고
// 전역 rehype-sanitize도 그대로 적용된다(별도 마크다운 파서를 새로 안 만들어도 됨).
// 필드명을 answer로 따로 뒀다면 이 자동 새니타이즈 파이프라인을 못 타서 별도 처리가
// 필요했을 것 — 기존 승인된 패턴 재사용이라 여기서 바로 결정.
const qa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/qa' }),
  schema: z.object({
    section: z.enum([
      'understanding-blindness',
      'daily-life',
      'etiquette',
      'acceptance',
      'independent-living',
      'counseling',
      'audiobook',
      'volunteer1365',
    ]),
    question: z.string(),
    order: z.number().int(),
  }),
});

// 2026-08-19 작업지시서 — 강의 안내 "강의 종류" 카드를 CMS 폴더형 컬렉션으로 전환.
// 강사 프로필과 동일 이유(개수가 늘고 줌). order는 gallery와 동일 패턴(config.yml의
// reorder:true가 드래그 시 채워 넣는 값, CMS 필드 목록엔 노출 안 함).
const lectures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lectures' }),
  schema: z.object({
    target: z.string(),
    title: z.string(),
    desc: z.string(),
    meta: z.string(),
    mandatory: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

// 2026-08-19 작업지시서 — "기타 전문교육" 카드도 동일하게 전환. 번호(01/02/03...)는
// 필드로 저장하지 않고 화면 렌더링 시 순서 기준으로 계산한다(ExtraCourseGrid.astro).
const extraCourses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/extra-courses' }),
  schema: z.object({
    title: z.string(),
    desc: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = {
  notices,
  'network-orgs': networkOrgs,
  sponsors,
  'donation-reports': donationReports,
  leadership,
  gallery,
  instructors,
  'org-info': orgInfo,
  qa,
  lectures,
  'extra-courses': extraCourses,
};
