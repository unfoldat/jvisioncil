import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';

// 본문(마크다운) 삽입 사진이 세로(포스터형)인지 빌드 타임에 판별한다 — 세로 사진만
// 표시 폭을 좁혀 본문 흐름에 자연스럽게 넣기 위함(자세한 이유는 [slug].astro 참고).
// 파일을 못 읽거나(경로 오류·손상·미지원 형식) 크기를 못 읽으면 크래시 대신 가로형(false)
// 으로 간주하고 넘어간다 — sponsors 폴더가 없어서 빌드 전체가 죽었던 사고와 같은 실패
// 패턴이 재발하지 않게 하기 위한 안전장치.
export function isPortraitImage(publicSrc: string): boolean {
  if (!publicSrc || !publicSrc.startsWith('/')) return false;
  try {
    // publicSrc는 마크다운/HTML의 URL(퍼센트 인코딩, 예: %ED%8F%AC...) — 실제 파일
    // 시스템 경로는 디코딩된 문자열(예: 포스터.png)이라 그대로 쓰면 파일을 못 찾는다.
    const filePath = path.join(process.cwd(), 'public', decodeURIComponent(publicSrc));
    const buffer = fs.readFileSync(filePath);
    const { width, height } = imageSize(buffer);
    if (!width || !height) return false;
    return height > width;
  } catch {
    return false;
  }
}
