// 라벨 동결 대상 값 + 클라이언트 확인 필요 값의 단일 출처.

export const SITE_NAME = '좋은비전';
export const ORG_FULL_NAME = '좋은비전장애인자립생활센터';
export const SITE_DESCRIPTION = '좋은비전장애인자립생활센터';

// 2026-08-17 목업 PAGES 순서·라벨·색상 그대로 — 활성 탭은 그 페이지 고유의 강조색으로
// "책갈피"처럼 튀어야 한다(전부 같은 색이면 안 됨). tab/tabInk는 목업 PAGES 배열의
// tab/tabInk, pageBg는 그 페이지 본문 최상단 배경색(활성 탭 밑선이 본문과 이어져 보이게).
export const MAIN_MENU = [
  { label: '홈', href: '/', tab: '#F7F3E8', tabInk: '#26221A', pageBg: '#F7F3E8' },
  { label: '센터소개', href: '/기관소개/', tab: '#E3A857', tabInk: '#1A1512', pageBg: '#F9EEDD' },
  { label: '전문상담', href: '/상담안내/', tab: '#D97736', tabInk: '#1A1512', pageBg: '#F6DECF' },
  { label: '강의 안내', href: '/강의/', tab: '#C87A7A', tabInk: '#1A1512', pageBg: '#F4E4E4' },
  { label: '소식', href: '/소식/', tab: '#8E7193', tabInk: '#000000', pageBg: '#EDE8EE' },
  // extraActivePaths — URL이 이 탭의 href 밑에 중첩돼 있지 않지만(별도 최상위 경로)
  // breadcrumb상으로는 이 탭의 하위인 페이지. 기부금 공시(/기부금-공시/)가 그 예:
  // "후원 > 기부금 공시" breadcrumb은 있지만 URL은 /후원안내/ 밑이 아니다.
  { label: '후원', href: '/후원안내/', tab: '#6C9A9C', tabInk: '#1A1512', pageBg: '#E5EDED', extraActivePaths: ['/기부금-공시/'] },
];

// 푸터 메뉴 — 목업 푸터 링크 그대로(기부금 공시·오시는 길·부설연구소), 그 외 추가 없음.
export const FOOTER_MENU = [
  { label: '기부금 공시 내역', href: '/기부금-공시/' },
  { label: '오시는 길', href: '/기관소개/#about-way' },
];

// 2026-08-26 — "부설 좋은비전재활상담연구소" 텍스트 바로 아래 배치하는 전용 링크.
// FOOTER_MENU와 분리한 이유: 관계 있는 정보(부설연구소 이름·링크)를 인접시키기
// 위해 푸터에서 별도 위치에 렌더링해야 해서 같은 배열에 있으면 처리가 꼬인다.
export const FOOTER_LAB_LINK = { label: '부설연구소', href: '/기관소개/#about-lab' };

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
