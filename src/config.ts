// 라벨 동결 대상 값 + 클라이언트 확인 필요 값의 단일 출처.

export interface Link {
  label: string;
  href: string;
}

export const SITE_NAME = '좋은비전';

// ⚠️ 정지 지점 P1 — 대표 전화번호 실값 클라이언트 확인 필요. 아래는 placeholder.
export const PHONE = {
  display: '000-0000-0000',
  tel: '00000000000',
};

// 스펙 §2.2 — 대리 행위자(가족·지인) 대상 문구. 라벨 동결.
export const PHONE_NOTE = '본인이 아니어도 됩니다. 가족·지인의 상담 문의를 환영합니다.';

// 스펙 §1 — 주 메뉴 4개. 라벨 동결.
export const MAIN_MENU = [
  { label: '기관소개', href: '/기관소개/' },
  { label: '상담안내', href: '/상담안내/' },
  { label: '후원안내', href: '/후원안내/' },
  { label: '소식', href: '/소식/' },
];

// 스펙 §4 — 전이표 표제. 라벨 동결.
export const RELATED_HEADING = '여기서 갈 수 있는 곳';

// 연습 배포 기간에만 true. 실도메인 전환 시 false로 바꾸는 커밋을 따로 낸다.
export const NOINDEX = true;
