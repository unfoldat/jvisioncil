import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { CollectionEntry } from 'astro:content';

type Report = CollectionEntry<'donation-reports'>;

// 제목은 별도 필드로 저장하지 않고 연도에서 만든다 — 편집자가 매번 같은 문구를 입력하지 않게.
export const reportTitle = (report: Report) => `${report.data.year}년 내역입니다`;

export const sortForList = (reports: Report[]): Report[] =>
  [...reports].sort((a, b) => b.data.year - a.data.year);

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
