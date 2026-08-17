import { getCollection, getEntry } from 'astro:content';
import { noticeHref, noticeOrgDisplay } from '../lib/notices';
import { orgMap } from '../lib/networkOrgs';

const orgInfo = await getEntry('org-info', 'info');

// 정적 페이지 인덱스 — 목업의 SEARCH_INDEX를 실제 라우트에 맞춰 옮김.
const STATIC_ENTRIES = [
  { page: '전문상담', href: '/상담안내/', title: '전문상담', snippet: `전화 상담과 상담 신청서 접수. 중도실명인 재활 컨설팅, 심리평가, 청소년 진로상담을 안내합니다.`, keys: `상담 전문상담 심리평가 진로 컨설팅 중도실명 신청 전화 ${orgInfo.data.phone} 가족` },
  { page: '강의 안내', href: '/강의/', title: '강의 안내', snippet: '직장 내 장애인 인식개선 교육, 사회적 장애인식개선 교육 등 대상별 강의를 안내합니다.', keys: '강의 교육 인식개선 직장 노인 실명예방 유아 청소년 강사 신청' },
  { page: '소식', href: '/소식/', title: '소식', snippet: '센터와 협력기관의 활동 소식을 전합니다.', keys: '소식 공지 공지사항 게시판 새소식 활동 알림 뉴스' },
  { page: '후원', href: '/후원안내/', title: '후원 안내 · 후원 계좌', snippet: '후원 계좌와 기부금 영수증 신청 방법을 안내합니다.', keys: '후원 계좌 기부 입금 통장 후원금 영수증 연말정산 세액공제' },
  { page: '후원', href: '/기부금-공시/', title: '기부금 공시 내역', snippet: '연간 기부금 모금액과 활용실적을 공시합니다.', keys: '기부금공시 공시 모금액 활용실적 결산 투명성 보고서' },
  { page: '센터소개', href: '/기관소개/', title: '센터소개', snippet: '좋은비전장애인자립생활센터의 소개, 센터장·부센터장, 주요사업·특화사업을 안내합니다.', keys: '센터소개 소개 인사말 비전 주요사업 특화사업 낭독 컨설팅 센터장' },
  { page: '센터소개', href: '/기관소개/#about-way', title: '오시는 길', snippet: '서울 은평구 응암로34길 24-8 한솔하이빌 101호. 지하철·버스 안내.', keys: '오시는길 위치 주소 약도 지도 응암 은평 교통 방문 찾아오는길' },
  { page: '센터소개', href: '/기관소개/#about-lab', title: '좋은비전재활상담연구소', snippet: '부설 연구소 소개와 주요 연구 분야를 안내합니다.', keys: '연구소 부설기관 재활상담연구소 연구 접근성' },
];

export async function GET() {
  const notices = await getCollection('notices');
  const orgs = await orgMap();
  const noticeEntries = notices.map((notice) => {
    const { href, external } = noticeHref(notice);
    const orgName = noticeOrgDisplay(notice, orgs).name;
    return {
      page: '소식',
      href,
      external,
      title: notice.data.title,
      snippet: `${orgName} · 소식`,
      keys: `${notice.data.title} ${orgName}`,
    };
  });

  return new Response(JSON.stringify([...STATIC_ENTRIES, ...noticeEntries]), {
    headers: { 'Content-Type': 'application/json' },
  });
}
