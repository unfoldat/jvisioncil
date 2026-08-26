import type { CollectionEntry } from 'astro:content';

type Notice = CollectionEntry<'notices'>;

// 소식 = 좋은비전 단독 게시판(확정 결정) — 전부 내부 상세 페이지로 고정.
export function noticeHref(notice: Notice): { href: string } {
  return { href: `/소식/${notice.id}/` };
}

// 2026-08-26 — date는 시:분 없이 날짜만 저장해서(연/월/일) 같은 날짜인 글끼리는
// 동점이 난다. id(=slug, "{{year}}-{{month}}-{{day}}-{{slug}}" 형식이라 실제
// 생성일이 그대로 남아있음)를 내림차순 2차 기준으로 써서 동점을 실제 생성 시점
// 순으로 깬다(홈 미리보기와 동일 원칙 — index.astro 참고). 이 함수는 소식
// 목록(sortForList)과 RSS 피드(rss.xml.js) 둘 다에서 쓰여 양쪽 다 같은 순서를
// 보장한다.
export const byDateDesc = (a: Notice, b: Notice) => b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id);

// 목록 표시 순서: 고정 글이 최상단, 그 안에서는 최신순.
export function sortForList(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return byDateDesc(a, b);
  });
}

// 페이지네이션(작업지시서) — 목업 실측(design-mockup #/news, 6개/페이지)과 동일.
// 기부금 공시 페이지네이션(src/lib/donationReports.ts)과 같은 패턴.
export const PAGE_SIZE = 6;
export const totalPages = (count: number): number => Math.max(1, Math.ceil(count / PAGE_SIZE));
