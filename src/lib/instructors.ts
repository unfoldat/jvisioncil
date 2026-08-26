import type { CollectionEntry } from 'astro:content';

type Instructor = CollectionEntry<'instructors'>;

// 2026-08-26 확정 결정 — 김기현은 메인 강사(유일하게 수작업으로 상세 프로필을
// 채운 특수 케이스)라, CMS로 강사가 몇 명 추가되든 목록 순서와 무관하게 항상
// 맨 위에 고정한다. 나머지는 기존 순서(파일 로더가 준 순서) 그대로 — Array.sort는
// 안정 정렬이라 상대 순서가 안 바뀐다.
const MAIN_INSTRUCTOR_ID = '김기현';

export function sortForList(instructors: Instructor[]): Instructor[] {
  return [...instructors].sort((a, b) => {
    if (a.id === MAIN_INSTRUCTOR_ID) return -1;
    if (b.id === MAIN_INSTRUCTOR_ID) return 1;
    return 0;
  });
}
