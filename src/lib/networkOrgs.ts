import { getCollection, type CollectionEntry } from 'astro:content';

type Org = CollectionEntry<'network-orgs'>;

// id(파일 슬러그) → 기관 엔트리. 소식의 org(reference)는 id만 갖고 있어서
// 이름·url을 보여주려면 이 맵으로 한 번에 조회한다 (엔트리마다 getEntry 왕복 방지).
export async function orgMap(): Promise<Map<string, Org>> {
  const orgs = await getCollection('network-orgs');
  return new Map(orgs.map((org) => [org.id, org]));
}

// 협력기관 배너(기관소개/홈)에 실제로 노출할 기관 — 좋은비전 등 internal 제외.
export async function partnerOrgs(): Promise<Org[]> {
  const orgs = await getCollection('network-orgs');
  return orgs.filter((org) => !org.data.internal).sort((a, b) => a.id.localeCompare(b.id));
}

// 소식 기관 필터 탭 — 좋은비전(internal)을 포함해 등록된 기관 전체, 항상 노출.
// 정렬: 좋은비전 최우선 → 나머지 협력기관(id순) → 그 외 내부 항목(마이그레이션 스텁 등).
export async function filterableOrgs(): Promise<Org[]> {
  const orgs = await getCollection('network-orgs');
  const rank = (org: Org) => (org.id === '좋은비전' ? 0 : org.data.internal ? 2 : 1);
  return orgs.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}
