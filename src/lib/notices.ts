import type { CollectionEntry } from 'astro:content';

type Notice = CollectionEntry<'notices'>;

// 소식 = 좋은비전 단독 게시판(확정 결정) — 전부 내부 상세 페이지로 고정.
export function noticeHref(notice: Notice): { href: string } {
  return { href: `/소식/${notice.id}/` };
}

export const byDateDesc = (a: Notice, b: Notice) => b.data.date.valueOf() - a.data.date.valueOf();

// 목록 표시 순서: 고정 글이 최상단, 그 안에서는 최신순.
export function sortForList(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return byDateDesc(a, b);
  });
}
