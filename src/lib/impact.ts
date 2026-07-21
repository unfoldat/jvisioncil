import type { CollectionEntry } from 'astro:content';

type Impact = CollectionEntry<'impact'>;

// 스펙 §0.1 무보관 원칙 예외: 좋은비전이 원본인 콘텐츠는 발행이지 보관이 아님 — notices와 동일 논리.
export const impactPath = (entry: Impact) => `/함께-만드는-변화/${entry.id}/`;

export const publishedOnly = (entries: Impact[]) => entries.filter((e) => e.data.status === 'published');

export const byDateDesc = (a: Impact, b: Impact) => b.data.date.valueOf() - a.data.date.valueOf();

// 후원안내 카드 목록: 공개 게시물만, 최신순.
export const sortForList = (entries: Impact[]) => publishedOnly(entries).sort(byDateDesc);
