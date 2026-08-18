import type { CollectionEntry } from 'astro:content';

type ExtraCourse = CollectionEntry<'extra-courses'>;

// gallery와 동일한 reorder 패턴 — order 없는 항목(드래그로 아직 정렬 안 한 것)은 맨 뒤로.
export function sortForList(courses: ExtraCourse[]): ExtraCourse[] {
  return [...courses].sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
}

// 페이지네이션 — 사용자 지시(작업지시서): 기타 전문교육은 한 페이지 최대 6개.
export const PAGE_SIZE = 6;
export const totalPages = (count: number): number => Math.max(1, Math.ceil(count / PAGE_SIZE));
