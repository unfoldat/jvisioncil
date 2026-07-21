// 빌드 후 보안 헤더를 dist/_headers에 주입한다 (OWASP A05).
//
// 왜 astro build 이후에 실행하나: dist 전체에서 src 없는 <script>(인라인)를 전부 스캔해
// 정확한 해시값을 CSP script-src에 넣어야 하는데, 이건 빌드 산출물을 봐야 계산된다.
// 2026-07-21 기준 인라인 스크립트 2개 — ① BaseLayout(글자 배율·메뉴 토글, 전 페이지 공용)
// ② src/pages/검색.astro(pagefind 동적 import, @vite-ignore 때문에 인라인 유지됨).
// 스크립트가 바뀌면 해시도 자동으로 다시 계산되므로 수동 유지보수가 필요 없다.
//
// 사이트 전체에 CSP를 하나만 쓰는 이유: Cloudflare Pages _headers는 겹치는 경로
// 규칙의 같은 헤더 값을 콤마로 "합친다"(덮어쓰지 않음) — 문서 확인 완료
// (base/판정-보안기준.md 참고). /*와 /admin/*에 각각 다른 CSP를 두면 브라우저가
// 두 정책의 교집합(더 엄격한 쪽)을 강제해 admin이 깨진다. 그래서 공개 페이지
// 요구사항(pagefind wasm/worker)과 admin 요구사항(Sveltia CMS 공식 CSP 빌더 결과 —
// GitHub 백엔드 선택)을 합집합으로 묶은 정책 하나만 전체에 적용한다.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const scriptHashes = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const code = m[1];
    if (!code.trim()) continue;
    const hash = createHash('sha256').update(code, 'utf8').digest('base64');
    scriptHashes.add(`'sha256-${hash}'`);
  }
}

// Sveltia CMS 공식 CSP 빌더(sveltiacms.app/en/docs/security, GitHub 백엔드 선택)가
// 제시한 값 그대로 채택 + 자체 호스팅이라 unpkg 의존은 남는 부분만(PDF.js/Prism 등
// Sveltia 내부에서 여전히 unpkg를 쓰는 보조 기능) 유지.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'wasm-unsafe-eval' https://unpkg.com ${[...scriptHashes].join(' ')}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https://*.githubusercontent.com`,
  `media-src blob:`,
  `frame-src blob:`,
  `connect-src 'self' blob: data: https://unpkg.com https://api.github.com https://www.githubstatus.com`,
  `worker-src 'self'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join('; ');

const headersPath = join(DIST, '_headers');
const existing = readFileSync(headersPath, 'utf8').trimEnd();

const securityHeaders = [
  `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
  `Content-Security-Policy: ${csp}`,
]
  .map((line) => `  ${line}`)
  .join('\n');

writeFileSync(headersPath, `${existing}\n${securityHeaders}\n`);
console.log(`_headers에 보안 헤더 주입 완료 (script-src 해시 ${scriptHashes.size}개)`);
