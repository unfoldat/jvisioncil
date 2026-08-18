import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { CollectionEntry } from 'astro:content';

type Report = CollectionEntry<'donation-reports'>;

export const sortForList = (reports: Report[]): Report[] =>
  [...reports].sort((a, b) => b.data.year - a.data.year);

// 2026-08-18 페이지네이션(작업지시서) — 한 페이지 6개년.
export const PAGE_SIZE = 6;
export const totalPages = (count: number): number => Math.max(1, Math.ceil(count / PAGE_SIZE));

// "{year}년 {title} 다운로드" 형태 — title에 이미 연도가 들어있으면(흔한 표기,
// 예: "2025년 내역입니다") 연도를 두 번 말하지 않는다.
export function downloadAriaLabel(report: Report): string {
  const yearPrefix = `${report.data.year}년`;
  const title = report.data.title;
  return title.includes(yearPrefix) ? `${title} 다운로드` : `${yearPrefix} ${title} 다운로드`;
}

// 다운로드 전 파일 용량을 알려주기 위해 public/ 아래 실제 파일 크기를 빌드 시점에 읽는다.
export function fileSizeLabel(publicPath: string): string {
  try {
    const diskPath = join(process.cwd(), 'public', decodeURIComponent(publicPath));
    const bytes = statSync(diskPath).size;
    const mb = bytes / 1024 / 1024;
    return mb >= 0.1 ? `${mb.toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
  } catch {
    return 'PDF';
  }
}
