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

// 데모: 주 메뉴(홈 제외) 5항목에 순서대로 배정한 색 — 그 메뉴 클릭 시 활성 표시
// 박스 색과 페이지 상단 강조선 색으로 함께 씀. 홈은 배정 없음(브랜드 기본색 유지).
export const MENU_COLORS: Record<string, string> = {
  '/기관소개/': '#D97736', // 주황 — 테라코타 / 버트 오렌지
  '/상담안내/': '#6C9A9C', // 하늘 — 세이지 스카이 / 둔 하늘
  '/소식/': '#8E7193', // 보라 — 더스티 플럼 / 라벤더 그레이
  '/강의/': '#E3A857', // 버터 옐로우 / 크림 옐로우
  '/후원안내/': '#C87A7A', // 로즈 브라운 / 코랄 더스티 로즈
};

// 위 항목의 하위 경로(예: /소식/2026-.../, /소식/태그/...)도 같은 색을 물려받도록
// 가장 긴 접두사로 매칭한다.
export function menuColorFor(path: string): string | undefined {
  return Object.entries(MENU_COLORS)
    .filter(([href]) => path.startsWith(href))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1];
}

// 푸터 메뉴 — 주 메뉴와 별도, 4항목만.
export const FOOTER_MENU = [
  { label: '센터소개', href: '/기관소개/' },
  { label: '전문상담', href: '/상담안내/' },
  { label: '후원', href: '/후원안내/' },
  { label: '콘텐츠 관리', href: '/admin/' },
];

// 공식 자료 확인 전 자리표시자 — 독수리 확인 필요 (정지 지점).
export const ADDRESS_PLACEHOLDER = '공식 자료 확인 후 입력';
export const EMAIL_PLACEHOLDER = '공식 자료 확인 후 입력';

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
