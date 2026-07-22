import type { CollectionEntry } from 'astro:content';
import { SITE_NAME } from '../config';

type Notice = CollectionEntry<'notices'>;
type Org = CollectionEntry<'network-orgs'>;

// orgId(= network-orgs 엔트리 id, 또는 좋은비전 자체를 뜻하는 SITE_NAME)에 공백·괄호가
// 있으므로 href는 인코딩해서 낸다.
export const 태그경로 = (orgId: string) => `/소식/태그/${encodeURIComponent(orgId)}/`;

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

// 발행 주체가 좋은비전이면 network-orgs를 아예 참조하지 않으므로(센터 자체는 협력기관이
// 아니다), 표시용 이름·url은 이 헬퍼로 한 곳에서 결정한다.
export function noticeOrgDisplay(notice: Notice, orgs: Map<string, Org>): { name: string; url?: string } {
  if (notice.data.publisher === '좋은비전') return { name: SITE_NAME };
  const org = notice.data.org ? orgs.get(notice.data.org.id) : undefined;
  return { name: org?.data.name ?? notice.data.org?.id ?? '협력기관', url: org?.data.url };
}

// 소식 필터 탭 대상: 좋은비전(가상 항목, network-orgs에는 없음) + 등록된 협력기관 전체.
export function filterTargets(orgs: Org[]): { id: string; name: string }[] {
  return [{ id: SITE_NAME, name: SITE_NAME }, ...orgs.map((org) => ({ id: org.id, name: org.data.name }))];
}

// 태그 페이지가 특정 대상(좋은비전 또는 협력기관 id)에 속하는 소식만 골라낸다.
export function belongsToTarget(notice: Notice, targetId: string): boolean {
  if (targetId === SITE_NAME) return notice.data.publisher === '좋은비전';
  return notice.data.publisher === '협력기관' && notice.data.org?.id === targetId;
}
