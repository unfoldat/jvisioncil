import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// Sveltia CMS는 옵셔널 string 위젯을 비워두면 필드를 생략하지 않고 ''(빈 문자열)로
// 저장한다. z.string().url().optional()은 undefined만 통과시키고 ''은 그대로
// url() 검증에 넣어 "Invalid URL" 예외로 빌드가 죽는다 — ''을 undefined로 미리 바꾼다.
const optionalUrl = () => z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional());

// 스펙 §3.1 — url 있으면 외부 직행, 없으면 내부 상세(본문 = 마크다운 body).
// 2026-07-22 — 좋은비전은 network-orgs의 "협력기관"이 아니라 센터 자체이므로 데이터를
// 분리한다: publisher(발행 주체: 좋은비전|협력기관) + org(협력기관일 때만 network-orgs 참조).
// Sveltia CMS는 필드를 다른 필드 값에 따라 숨기는 기능이 아직 없어(공식 이슈 #139, 미해결)
// org 필드는 CMS 화면에 항상 보이지만, 아래 refine으로 "협력기관 ⇔ org 있음"을 빌드에서 강제한다.
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      publisher: z.enum(['좋은비전', '협력기관']),
      org: reference('network-orgs').optional(),
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
    })
    .refine((data) => (data.publisher === '협력기관') === Boolean(data.org), {
      message: '발행 주체가 "협력기관"이면 기관을 선택하고, "좋은비전"이면 기관을 비워두세요.',
      path: ['org'],
    }),
});

// network-orgs = 함께하는 기관(실제 외부 협력기관만) — 기관소개/홈 배너 + 소식의
// "협력기관" 발행 주체 선택 시 기관 선택(relation) + 태그 페이지 연결.
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

// 작업지시서(기부금 공시 파일 첨부 기능) — 기존 donation-reports 컬렉션을 갈아엎지 않고
// 확장한다: year·file은 기존 그대로, body(본문)만 신규 선택 필드로 추가. 제목은 별도
// 필드로 저장하지 않고 "{year}년 내역입니다" 형태로 코드에서 만든다. 법적 의무 문서
// (무보관 원칙의 유일한 예외).
const donationReports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/donation-reports' }),
  schema: z.object({
    year: z.number().int(),
    file: z.string(),
  }),
});

export const collections = {
  notices,
  'network-orgs': networkOrgs,
  sponsors,
  'donation-reports': donationReports,
};
