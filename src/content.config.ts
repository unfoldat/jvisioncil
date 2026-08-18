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
    url: z.string().url(),
  }),
});

// 2026-08-18 스키마 정정 — 이전 결정("title 필드 없음, {year}년 내역입니다로 자동생성")을
// 뒤집는다. title은 편집자가 직접 쓰는 필드다(자동생성 아님). year·file은 기존 그대로,
// body(본문)는 여전히 선택 필드. 법적 의무 문서(무보관 원칙의 유일한 예외).
const donationReports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/donation-reports' }),
  schema: z.object({
    year: z.number().int(),
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
    photoAlt: z.string().min(1),
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
    alt: z.string().min(1),
    showOn: z.array(z.enum(['home', 'news', 'donate'])).default(['home', 'news', 'donate']),
  }),
});

// 확정 스키마 결정(2026-08-17) — 강사 프로필은 폴더형(가변 개수). 강사를 추가/삭제하면
// 강의 안내 페이지 카드가 그만큼 자동으로 늘고 준다. bio는 리더의 약력 리스트(bio[])와
// 달리 목업에서 한 문단짜리 소개 텍스트였으므로 문자열 하나로 둔다.
const instructors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/instructors' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string(),
    photoAlt: z.string().min(1),
    bio: z.string(),
    // object-position 값. 비우면 페이지 쪽에서 기본값 적용(리더 프로필과 동일 패턴).
    photoPos: z.string().optional(),
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
};
