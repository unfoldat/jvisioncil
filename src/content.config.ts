import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 스펙 §3.1 — url 있으면 외부 직행, 없으면 내부 상세(본문 = 마크다운 body).
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    org: z.array(z.string()).min(1),
    // 해당 소식 글의 정확한 주소. 기관 메인 홈페이지를 붙이는 실수를 빌드에서 잡는다.
    url: z
      .string()
      .url()
      .refine((u) => new URL(u).pathname !== '/' || new URL(u).search !== '', {
        message: '기관 메인 홈페이지가 아니라 이 소식이 있는 정확한 글 주소를 넣으세요.',
      })
      .optional(),
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
    url: z.string().url().optional(),
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
