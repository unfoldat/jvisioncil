// @ts-check
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import rehypeSanitize from 'rehype-sanitize';

// https://astro.build/config
export default defineConfig({
  // 연습 배포 주소 (Cloudflare Pages 기본 도메인, 커스텀 도메인 미사용).
  // 실도메인 전환 시 https://jvisioncil.or.kr 로 변경.
  site: 'https://jvisioncil.pages.dev',
  integrations: [pagefind()],
  markdown: {
    // Astro 기본 마크다운 파이프라인은 raw HTML(<script> 등)을 그대로 통과시킨다.
    // notices body는 CMS 편집자가 쓰는 markdown이라 script/on* 핸들러를 걸러낸다.
    rehypePlugins: [rehypeSanitize],
  },
});
