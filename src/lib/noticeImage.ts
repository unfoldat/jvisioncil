import { isPortraitImage } from './imageOrientation';

// 소식 카드 썸네일은 편집자가 직접 넣는 별도 thumbnail 필드를 쓴다(작업지시서
// 2026-08-19 오후) — 본문 첫 이미지 자동 재사용은 카드·본문에 사진이 중복으로 뜨는
// 문제가 있어 폐지. 본문(rendered.html)은 스트립 없이 그대로 보여준다(사진 몇 장이든
// 전부 본문 흐름 안에 남는다).

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
