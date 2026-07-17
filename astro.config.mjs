// @ts-check
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  // 연습 배포 주소 (Cloudflare Pages 기본 도메인, 커스텀 도메인 미사용).
  // 실도메인 전환 시 https://jvisioncil.or.kr 로 변경.
  site: 'https://jvisioncil.pages.dev',
  integrations: [pagefind()],
});
