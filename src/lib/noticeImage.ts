import { isPortraitImage } from './imageOrientation';

// 소식 = 별도 대표 이미지 필드 없이, 본문(body)에 삽입한 첫 번째 마크다운 이미지를
// 카드 목록·상세 대표 이미지에 재사용한다(작업지시서 2026-08-19).

export interface NoticeImage {
  src: string;
  alt: string;
}

const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

// 본문(원본 마크다운)에서 첫 번째 이미지의 경로·대체텍스트만 뽑는다. 없으면 null
// (호출부는 이 경우 기존 로고 폴백을 그대로 쓴다).
export function firstBodyImage(body: string | undefined): NoticeImage | null {
  if (!body) return null;
  const match = body.match(MD_IMAGE_RE);
  if (!match) return null;
  return { alt: match[1], src: match[2] };
}

// rendered.html(컴파일된 본문)에서 첫 <img> 태그를 지운다 — 대표 이미지 박스와 본문에
// 같은 사진이 두 번 뜨지 않게 하기 위함. 이미지 하나만 담긴 <p>(마크다운이 단독 이미지
// 줄을 이렇게 감쌈)라면 그 <p>까지 통째로 지워 빈 문단이 안 남게 한다.
export function stripFirstImage(html: string | undefined): string {
  if (!html) return '';
  const wrappedRe = /<p>\s*<img\b[^>]*>\s*<\/p>/;
  if (wrappedRe.test(html)) return html.replace(wrappedRe, '');
  const imgMatch = html.match(/<img\b[^>]*>/);
  if (!imgMatch) return html;
  return html.replace(imgMatch[0], '');
}

// 남은 세로(포스터형) 사진에 표시 폭을 좁히는 클래스를 붙인다 — 빌드 타임 실측 기반,
// JS 없음(작업지시서). 판별 실패 시 isPortraitImage가 안전하게 false를 반환한다.
export function tagPortraitImages(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<img\b([^>]*)>/g, (tag, attrs) => {
    const srcMatch = attrs.match(/src="([^"]*)"/);
    const src = srcMatch ? srcMatch[1] : '';
    if (src && isPortraitImage(src)) return `<img class="post-img-portrait"${attrs}>`;
    return tag;
  });
}

// 본문에 남은 사진을 클릭하면 원본이 새 탭에서 열리도록 <a>로 감싼다(작업지시서 —
// 새 JS 라이브러리 없이 <a target="_blank"> 최소 구현).
export function linkifyImages(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const srcMatch = tag.match(/src="([^"]*)"/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return tag;
    return `<a class="post-img-link" href="${src}" target="_blank" rel="noopener"><span class="sr-only">원본 크기로 보기</span>${tag}</a>`;
  });
}

