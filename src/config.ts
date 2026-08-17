// 라벨 동결 대상 값 + 클라이언트 확인 필요 값의 단일 출처.

export const SITE_NAME = '좋은비전';
export const ORG_FULL_NAME = '좋은비전장애인자립생활센터';
export const SITE_DESCRIPTION = '좋은비전장애인자립생활센터';

// 2026-08-17 디자인 목업(design-mockup) 반영 — 목업 전화번호로 확정.
export const PHONE = {
  display: '02-732-0105',
  tel: '0227320105',
};

export const ADDRESS = '서울 은평구 응암로34길 24-8 한솔하이빌 101호';

// 2026-08-17 목업 PAGES 순서·라벨 그대로.
export const MAIN_MENU = [
  { label: '홈', href: '/' },
  { label: '센터소개', href: '/기관소개/' },
  { label: '전문상담', href: '/상담안내/' },
  { label: '강의 안내', href: '/강의/' },
  { label: '소식', href: '/소식/' },
  { label: '후원', href: '/후원안내/' },
];

// 푸터 메뉴 — 목업 푸터 링크(기부금 공시·오시는 길·부설연구소) + CMS 진입점(콘텐츠 관리).
export const FOOTER_MENU = [
  { label: '기부금 공시 내역', href: '/기부금-공시/' },
  { label: '오시는 길', href: '/기관소개/#about-way' },
  { label: '부설연구소', href: '/기관소개/#about-lab' },
  { label: '콘텐츠 관리', href: '/admin/' },
];

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
