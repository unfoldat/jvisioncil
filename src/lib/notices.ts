import type { CollectionEntry } from 'astro:content';
import type { Link } from '../config';

type Notice = CollectionEntry<'notices'>;

// 기관명에 공백·괄호가 있으므로 href는 인코딩해서 낸다.
export const 태그경로 = (org: string) => `/소식/태그/${encodeURIComponent(org)}/`;

// 스펙 §2.5 — 링크는 단독으로 읽혀도 완결. 템플릿 자동 조립, 편집자 수기 금지.
export function noticeLink(notice: Notice): Link & { external: boolean } {
  const org = notice.data.org[0];
  if (notice.data.url) {
    return {
      label: `[${org}] ${notice.data.title} (외부 사이트, 새 탭에서 열림)`,
      href: notice.data.url,
      external: true,
    };
  }
  return {
    label: `[${org}] ${notice.data.title}`,
    href: `/소식/${notice.id}/`,
    external: false,
  };
}

export const byDateDesc = (a: Notice, b: Notice) => b.data.date.valueOf() - a.data.date.valueOf();

// 기관별 글 수 (필터 행 노출 기준 = 2건 이상).
export function orgCounts(notices: Notice[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const notice of notices) {
    for (const org of notice.data.org) {
      counts.set(org, (counts.get(org) ?? 0) + 1);
    }
  }
  return counts;
}
