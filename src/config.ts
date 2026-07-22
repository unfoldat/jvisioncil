// 라벨 동결 대상 값 + 클라이언트 확인 필요 값의 단일 출처.

export const SITE_NAME = '좋은비전';
export const ORG_FULL_NAME = '좋은비전장애인자립생활센터';
export const SITE_DESCRIPTION = '좋은비전장애인자립생활센터';

// 2026-07-21 최종 디자인 반영 — 이전 잠정값(02-123-4567)에서 확정.
export const PHONE = {
  display: '010-2133-1381',
  tel: '01021331381',
};

// 2026-07-21 최종 디자인 반영 — 6항목 주 메뉴(홈 포함), 라벨 ≠ href 라우트명.
export const MAIN_MENU = [
  { label: '홈', href: '/' },
  { label: '센터소개', href: '/기관소개/' },
  { label: '전문상담', href: '/상담안내/' },
  { label: '소식', href: '/소식/' },
  { label: '강의', href: '/강의/' },
  { label: '후원', href: '/후원안내/' },
];

// 푸터 메뉴 — 주 메뉴와 별도, 5항목만.
// 기부금 공시: 후원안내의 "기부금 사용내역"과 같은 컬렉션을 쓰는 별도 메뉴/페이지(데모 브랜치).
export const FOOTER_MENU = [
  { label: '센터소개', href: '/기관소개/' },
  { label: '전문상담', href: '/상담안내/' },
  { label: '후원', href: '/후원안내/' },
  { label: '기부금 공시', href: '/기부금-공시/' },
  { label: '콘텐츠 관리', href: '/admin/' },
];

// 공식 자료 확인 전 자리표시자 — 독수리 확인 필요 (정지 지점).
export const ADDRESS_PLACEHOLDER = '공식 자료 확인 후 입력';
export const EMAIL_PLACEHOLDER = '공식 자료 확인 후 입력';

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
