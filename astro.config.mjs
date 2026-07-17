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
  build: {
    // 기본값('auto')은 작은 CSS를 <head>에 인라인 <style>로 박아 CSP에
    // style-src 'unsafe-inline'이 강제로 필요해진다. 항상 외부 파일로 뽑아서
    // style-src를 'self'만으로 잠글 수 있게 한다 (A05 CSP 강화).
    inlineStylesheets: 'never',
  },
  markdown: {
    // Astro 기본 마크다운 파이프라인은 raw HTML(<script> 등)을 그대로 통과시킨다.
    // notices body는 CMS 편집자가 쓰는 markdown이라 script/on* 핸들러를 걸러낸다.
    rehypePlugins: [rehypeSanitize],
  },
});
