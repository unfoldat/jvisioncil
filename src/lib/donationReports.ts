import type { CollectionEntry } from 'astro:content';

type Report = CollectionEntry<'donation-reports'>;

// 고정 글이 최상단, 그 안에서는 연도 최신순.
export function sortForList(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.year - a.data.year;
  });
}
