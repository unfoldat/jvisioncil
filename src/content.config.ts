import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 스펙 §3.1 — url 있으면 외부 직행, 없으면 내부 상세(본문 = 마크다운 body).
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    org: z.array(z.string()).min(1),
    url: z.string().url().optional(),
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
