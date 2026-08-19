import { isPortraitImage } from './imageOrientation';

// 소식 = 별도 대표 이미지 필드 없이, 본문(body)에 삽입한 첫 번째 마크다운 이미지를
// 카드 목록 썸네일로 재사용한다(작업지시서 2026-08-19). 상세페이지 상단 배너는 없음 —
// 본문(rendered.html)을 그대로 보여준다(스트립하지 않음).

export interface NoticeImage {
  src: string;
  alt: string;
}

const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

// 본문(원본 마크다운)에서 첫 번째 이미지의 경로·대체텍스트만 뽑는다 — 카드 썸네일용.
// 없으면 null(호출부는 이 경우 로고 폴백을 쓴다).
export function firstBodyImage(body: string | undefined): NoticeImage | null {
  if (!body) return null;
  const match = body.match(MD_IMAGE_RE);
  if (!match) return null;
  return { alt: match[1], src: match[2] };
}

// 세로(포스터형) 사진에 표시 폭을 좁히는 클래스를 붙인다 — 빌드 타임 실측 기반,
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

// 본문 사진을 클릭하면 원본이 새 탭에서 열리도록 <a>로 감싼다(작업지시서 — 새 JS
// 라이브러리 없이 <a target="_blank"> 최소 구현).
export function linkifyImages(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const srcMatch = tag.match(/src="([^"]*)"/);
    const src = srcMatch ? srcMatch[1] : '';
    if (!src) return tag;
    return `<a class="post-img-link" href="${src}" target="_blank" rel="noopener"><span class="sr-only">원본 크기로 보기</span>${tag}</a>`;
  });
}
