import type { CollectionEntry } from 'astro:content';

type Notice = CollectionEntry<'notices'>;

// 기관명에 공백·괄호가 있으므로 href는 인코딩해서 낸다.
export const 태그경로 = (org: string) => `/소식/태그/${encodeURIComponent(org)}/`;

// url 있으면 외부 직행, 없으면 내부 상세 — 필드가 아니라 데이터에서 도출.
export function noticeHref(notice: Notice): { href: string; external: boolean } {
  if (notice.data.url) return { href: notice.data.url, external: true };
  return { href: `/소식/${notice.id}/`, external: false };
}

export const byDateDesc = (a: Notice, b: Notice) => b.data.date.valueOf() - a.data.date.valueOf();

// 목록 표시 순서: 고정 글이 최상단, 그 안에서는 최신순.
export function sortForList(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return byDateDesc(a, b);
  });
}

// 기관별 글 수 (필터 탭 노출 기준 = 2건 이상).
export function orgCounts(notices: Notice[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const notice of notices) {
    for (const org of notice.data.org) {
      counts.set(org, (counts.get(org) ?? 0) + 1);
    }
  }
  return counts;
}
