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

// 목록 표시 순서: 고정 글이 최상단, 그 안에서는 최신순. 이전글/다음글(날짜순 인접)에는
// 쓰지 않는다 — pinned는 "목록에서 눈에 띄게"이지 읽기 순서 개념이 아니다.
export function sortForList(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return byDateDesc(a, b);
  });
}

// 상세 페이지의 이전 글/다음 글. 전체 소식을 날짜순으로 줄 세운 뒤 인접 항목을 찾는다
// (외부 직행 글도 포함 — 시간순 흐름은 내부/외부를 가리지 않는다).
export function adjacentNotices(notices: Notice[], id: string): { prev?: Notice; next?: Notice } {
  const sorted = [...notices].sort(byDateDesc);
  const idx = sorted.findIndex((n) => n.id === id);
  if (idx === -1) return {};
  return { prev: sorted[idx + 1], next: sorted[idx - 1] };
}

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
