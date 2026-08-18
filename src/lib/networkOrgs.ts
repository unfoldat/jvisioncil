import { getCollection, type CollectionEntry } from 'astro:content';

type Org = CollectionEntry<'network-orgs'>;

// 협력기관 배너(기관소개/홈)에 노출할 기관 — network-orgs는 이제 실제 협력기관만 담는다.
export async function partnerOrgs(): Promise<Org[]> {
  const orgs = await getCollection('network-orgs');
  return orgs.sort((a, b) => a.id.localeCompare(b.id));
}
