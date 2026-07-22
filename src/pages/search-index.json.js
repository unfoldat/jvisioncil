import { getCollection } from 'astro:content';
import { noticeHref, noticeOrgDisplay, filterTargets } from '../lib/notices';
import { orgMap } from '../lib/networkOrgs';

// Pagefind는 CJK 복합어를 통째로 한 토큰으로 인덱싱해서 "서울필로스합창단"의
// 부분 문자열("필로스")로는 못 찾는다(Pagefind 자체의 알려진 한계, 공식 이슈
// https://github.com/Pagefind/pagefind/issues/987 — 아직 미해결). 기관명·소식
// 제목처럼 짧고 개수가 적은 데이터는 이 정적 인덱스로 부분 문자열 매칭을 보완한다.
export async function GET() {
  const notices = await getCollection('notices');
  const networkOrgs = await getCollection('network-orgs');
  const orgs = await orgMap();

  const orgEntries = filterTargets(networkOrgs).map((target) => ({
    name: target.name,
    url: orgs.get(target.id)?.data.url,
    tagHref: `/소식/태그/${encodeURIComponent(target.id)}/`,
  }));

  const noticeEntries = notices.map((notice) => {
    const { href, external } = noticeHref(notice);
    return {
      title: notice.data.title,
      orgName: noticeOrgDisplay(notice, orgs).name,
      href,
      external,
    };
  });

  return new Response(JSON.stringify({ orgs: orgEntries, notices: noticeEntries }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
