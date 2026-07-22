import { getCollection, type CollectionEntry } from 'astro:content';

type Org = CollectionEntry<'network-orgs'>;

// id(파일 슬러그) → 기관 엔트리. 소식의 org(reference)는 id만 갖고 있어서
// 이름·url을 보여주려면 이 맵으로 한 번에 조회한다 (엔트리마다 getEntry 왕복 방지).
export async function orgMap(): Promise<Map<string, Org>> {
  const orgs = await getCollection('network-orgs');
  return new Map(orgs.map((org) => [org.id, org]));
}

// 협력기관 배너(기관소개/홈)에 노출할 기관 — network-orgs는 이제 실제 협력기관만 담는다.
export async function partnerOrgs(): Promise<Org[]> {
  const orgs = await getCollection('network-orgs');
  return orgs.sort((a, b) => a.id.localeCompare(b.id));
}
