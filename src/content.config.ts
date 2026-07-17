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
  }),
});

// 스펙 §3.4 — 태그 페이지 상단 매칭 단락 + footer 그리드 공급원.
const partners = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partners' }),
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    logo: z.string().optional(),
    desc: z.string(),
    when: z.string(),
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

export const collections = { notices, partners, 'donation-reports': donationReports };
