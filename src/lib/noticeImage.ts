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

// title 속성을 지운다 — CMS의 "제목" 필드가 마크다운 `![alt](src "title")` 문법을 통해
// title로 렌더링되는데, 실측(접근성 트리)에서 title이 alt보다 우선해서 읽히는 정황이
// 나왔다(작업지시서 2026-08-19, 원인 미확정이나 위험 방지 차원에서 렌더링 단계에서
// 제거). alt는 그대로 두고 title만 지워서 대체텍스트가 항상 alt 하나로만 계산되게 한다.
export function stripImageTitle(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<img\b([^>]*)>/g, (tag, attrs) => `<img${attrs.replace(/\s+title="[^"]*"/, '')}>`);
}
