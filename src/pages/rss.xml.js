import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { byDateDesc, noticeHref } from '../lib/notices';
import { SITE_NAME } from '../config';

// 소식 + 칼럼 통합 예정 (스펙 §6). columns 컬렉션은 아직 스키마·콘텐츠가 없어서
// (예약 상태, 글은 나중) 지금은 소식만 포함한다. columns가 생기면 getCollection('columns')
// 결과를 notices와 합쳐 date로 다시 정렬하면 된다 — 여기 구조를 바꿀 필요 없음.
export async function GET(context) {
  const notices = (await getCollection('notices')).sort(byDateDesc);

  return rss({
    title: SITE_NAME,
    description: '좋은비전 소식',
    site: context.site,
    items: notices.map((notice) => {
      return {
        title: notice.data.title,
        pubDate: notice.data.date,
        link: noticeHref(notice).href,
        description: notice.data.org.join(', '),
      };
    }),
  });
}
