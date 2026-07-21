import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Sveltia CMS는 옵셔널 string 위젯을 비워두면 필드를 생략하지 않고 ''(빈 문자열)로
// 저장한다. z.string().url().optional()은 undefined만 통과시키고 ''은 그대로
// url() 검증에 넣어 "Invalid URL" 예외로 빌드가 죽는다 — ''을 undefined로 미리 바꾼다.
const optionalUrl = () => z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());

// 스펙 §3.1 — url 있으면 외부 직행, 없으면 내부 상세(본문 = 마크다운 body).
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    org: z.array(z.string()).min(1),
    // 해당 소식 글의 정확한 주소. 기관 메인 홈페이지를 붙이는 실수를 빌드에서 잡는다.
    url: z
      .preprocess(
        (v) => (v === '' ? undefined : v),
        z
          .string()
          .url()
          .refine((u) => new URL(u).pathname !== '/' || new URL(u).search !== '', {
            message: '기관 메인 홈페이지가 아니라 이 소식이 있는 정확한 글 주소를 넣으세요.',
          })
          .optional(),
      ),
    // 목록 최상단 고정 + [공지] 표시. 날짜 정렬 자체는 안 바꾼다(이전글/다음글은 pinned 무관하게 날짜순).
    pinned: z.boolean().default(false),
  }),
});

// 협력기관을 두 컬렉션으로 분리 (독수리 지정).
// network-orgs = 함께하는 기관: 기관소개 섹션 + footer 배지 + 태그 페이지 연결.
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

// 스펙 §5 — 법적 의무 문서(무보관 원칙의 유일한 예외).
// 2026-07-21 최종 디자인 반영 — 보고서마다 HTML 상세 페이지가 생기면서 title/body 추가.
const donationReports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/donation-reports' }),
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
    date: z.coerce.date().optional(),
    pinned: z.boolean().default(false),
    file: z.string(),
  }),
});

// impact = 함께 만드는 변화: 좋은비전이 직접 수행한 활동·후원으로 만들어진 변화 아카이브.
// notices(소식: 공지·행사안내·외부기관 소식)와는 목적이 분리된 별도 컬렉션 (독수리 지정).
const impact = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/impact' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    // 카드·상세 페이지 모두 이 값을 <img alt>로 그대로 쓴다 — 빈 문자열이면 CMS 필수 검증에서 막힌다.
    image_alt: z.string().min(1),
    summary: z.string(),
    category: z.enum(['상담', '강연', '행사', '협력 활동', '후원 이야기', '기타']),
    link: optionalUrl(),
    status: z.enum(['draft', 'published']).default('draft'),
  }),
});

// 2026-07-21 최종 디자인 반영 — first-guides = 처음 오신 분께 (신규, 이전엔 예약 상태였음).
const firstGuides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/first-guides' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    pinned: z.boolean().default(false),
  }),
});

export const collections = {
  notices,
  'network-orgs': networkOrgs,
  sponsors,
  'donation-reports': donationReports,
  impact,
  'first-guides': firstGuides,
};
