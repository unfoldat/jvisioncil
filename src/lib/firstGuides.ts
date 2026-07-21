import type { CollectionEntry } from 'astro:content';

type Guide = CollectionEntry<'first-guides'>;

export const guidePath = (entry: Guide) => `/처음-오신-분께/${entry.id}/`;

// 고정 글이 최상단, 그 안에서는 최신순(날짜 없는 글은 뒤로).
export function sortForList(guides: Guide[]): Guide[] {
  return [...guides].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0);
  });
}
