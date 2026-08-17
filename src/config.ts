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

// 2026-08-17 목업 PAGES 순서·라벨·색상 그대로 — 활성 탭은 그 페이지 고유의 강조색으로
// "책갈피"처럼 튀어야 한다(전부 같은 색이면 안 됨). tab/tabInk는 목업 PAGES 배열의
// tab/tabInk, pageBg는 그 페이지 본문 최상단 배경색(활성 탭 밑선이 본문과 이어져 보이게).
export const MAIN_MENU = [
  { label: '홈', href: '/', tab: '#F7F3E8', tabInk: '#26221A', pageBg: '#F7F3E8' },
  { label: '센터소개', href: '/기관소개/', tab: '#E3A857', tabInk: '#1A1512', pageBg: '#F9EEDD' },
  { label: '전문상담', href: '/상담안내/', tab: '#D97736', tabInk: '#1A1512', pageBg: '#F6DECF' },
  { label: '강의 안내', href: '/강의/', tab: '#C87A7A', tabInk: '#1A1512', pageBg: '#F4E4E4' },
  { label: '소식', href: '/소식/', tab: '#8E7193', tabInk: '#000000', pageBg: '#EDE8EE' },
  { label: '후원', href: '/후원안내/', tab: '#6C9A9C', tabInk: '#1A1512', pageBg: '#E5EDED' },
];

// 푸터 메뉴 — 목업 푸터 링크 그대로(기부금 공시·오시는 길·부설연구소), 그 외 추가 없음.
export const FOOTER_MENU = [
  { label: '기부금 공시 내역', href: '/기부금-공시/' },
  { label: '오시는 길', href: '/기관소개/#about-way' },
  { label: '부설연구소', href: '/기관소개/#about-lab' },
];

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
