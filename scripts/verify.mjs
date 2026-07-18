// 빌드 게이트 (스펙 §7 DoD). dist HTML을 스캔해 계약 위반이면 빌드를 실패시킨다.
// 실행: npm run verify (build 후 자동 실행)
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const 표제 = '여기서 갈 수 있는 곳';

// /admin은 사이트 페이지가 아니라 CMS 셸 — 검사 대상에서 제외.
const 제외 = (url) => url.startsWith('/admin/');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const toUrl = (file) =>
  '/' + path.relative(DIST, file).split(path.sep).join('/').replace(/index\.html$/, '');

const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 협력기관 배지 검사의 정답지: network-orgs 컨텐츠 소스에서 name/url을 직접 읽는다
// (렌더링 결과가 아니라 소스 진실을 기준으로 대조 — 회귀를 잡아내는 핵심).
const NETWORK_ORGS_DIR = 'src/content/network-orgs';
const networkOrgs = fs
  .readdirSync(NETWORK_ORGS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = fs.readFileSync(path.join(NETWORK_ORGS_DIR, f), 'utf8');
    return {
      name: raw.match(/^name:\s*(.+)$/m)?.[1]?.trim(),
      url: raw.match(/^url:\s*(.+)$/m)?.[1]?.trim(),
    };
  });

const 검사 = [];
const 실패 = [];

const pages = walk(DIST)
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({ file: f, url: toUrl(f), html: fs.readFileSync(f, 'utf8') }))
  .filter((p) => !제외(p.url));

for (const page of pages) {
  const { url, html } = page;
  const fail = (code, msg) => 실패.push({ url, code, msg });

  const main = html.split(/<main[^>]*>/)[1]?.split('</main>')[0] ?? '';
  const h2s = [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));

  // D1. 편집창은 검색창 1개
  const inputs = [...html.matchAll(/<(input|textarea)\b/g)].length;
  if (inputs !== 1) fail('D1', `입력 요소 ${inputs}개 (검색창 1개여야 함)`);

  // D2. 마지막 h2 = "여기서 갈 수 있는 곳"
  if (h2s.length === 0) fail('D2', 'main에 h2가 없음');
  else if (h2s.at(-1) !== 표제) fail('D2', `마지막 h2가 "${h2s.at(-1)}"`);

  // D3. title 패턴 + h1 일치
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const h1s = [...main.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const m = title.match(/^(.+) – 좋은비전$/);
  if (!m) fail('D3', `title 형식 위반: "${title}"`);
  if (h1s.length !== 1) fail('D3', `h1 ${h1s.length}개 (1개여야 함)`);
  else if (m && h1s[0] !== m[1]) fail('D3', `h1("${h1s[0]}") ≠ title 페이지명("${m[1]}")`);

  // D4. 랜드마크 4종 각 1개 이하
  const 랜드마크 = {
    search: [...html.matchAll(/role=["']search["']/g)].length,
    nav: [...html.matchAll(/<nav\b/g)].length,
    main: [...html.matchAll(/<main\b/g)].length,
    footer: [...html.matchAll(/<footer\b/g)].length,
  };
  for (const [name, n] of Object.entries(랜드마크)) {
    if (n > 1) fail('D4', `랜드마크 ${name} ${n}개`);
  }

  // D5. 막다른 페이지 0개 — 전이표에 링크가 1개 이상
  // h2는 Astro scoped style이 data-astro-cid-* 속성을 붙이므로 속성 유무와
  // 무관하게 매칭한다 (문자열 그대로 찾으면 속성이 붙는 순간 매치가 깨진다).
  const h2Matches = [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)];
  const lastH2 = h2Matches.at(-1);
  const 전이표 = lastH2 && strip(lastH2[1]) === 표제 ? main.slice(lastH2.index + lastH2[0].length) : '';
  const 출구 = [...전이표.matchAll(/<a\s[^>]*href=/g)].length;
  if (출구 === 0) fail('D5', '전이표에 링크 0개 (막다른 페이지)');

  // 연습 배포: 전 페이지 noindex
  if (!/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    fail('noindex', '연습 배포인데 noindex 메타가 없음');
  }

  // 이미지 alt 필수
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
  for (const img of imgs) {
    if (!/\salt=/.test(img[0])) fail('alt', `alt 없는 이미지: ${img[0].slice(0, 60)}`);
  }

  // PARTNER-LOC. 협력기관 그리드는 footer 전용 — main에 있으면 회귀.
  const footer = html.split(/<footer[^>]*>/)[1]?.split('</footer>')[0] ?? '';
  if (main.includes('partner-grid') || main.includes('협력기관')) {
    fail('PARTNER', '협력기관 그리드가 main 안에 있음 (footer 전용이어야 함, §5)');
  }
  if (!footer.includes('partner-grid')) {
    fail('PARTNER', 'footer에 협력기관 그리드가 없음');
  }

  // PARTNER-URL. 배지 목적지가 소스(url 유무)와 일치하는지 대조.
  // url 있으면 그 URL로 직행, 없으면 링크 없이 텍스트만 — 태그 페이지(/소식/태그/)로
  // 새는 것도, url 없는데 아무 링크가 붙는 것도 전부 회귀로 잡는다.
  for (const org of networkOrgs) {
    if (!org.name) continue;
    const liMatch = footer.match(
      new RegExp(`<li[^>]*>((?:(?!</li>)[\\s\\S])*?${escapeRegExp(org.name)}(?:(?!</li>)[\\s\\S])*?)</li>`),
    );
    if (!liMatch) {
      fail('PARTNER', `footer에 "${org.name}" 배지가 없음`);
      continue;
    }
    const aHref = liMatch[1].match(/<a\s[^>]*href="([^"]*)"/)?.[1];
    if (org.url) {
      if (!aHref) fail('PARTNER', `"${org.name}": url이 있는데 배지가 링크가 아님`);
      else if (aHref !== org.url) {
        fail('PARTNER', `"${org.name}": 배지가 "${aHref}"로 나감 (기대값 "${org.url}")`);
      }
    } else if (aHref) {
      fail('PARTNER', `"${org.name}": url이 없는데 배지가 "${aHref}"로 링크됨 (텍스트만이어야 함)`);
    }
  }

  검사.push({ url, 출구, h2끝: h2s.at(-1) ?? '(없음)', inputs });
}

console.log(`검사 페이지 ${pages.length}개 (/admin 제외)\n`);
console.log('D5 — 전이표 출구 수 (0이면 막다른 페이지)');
for (const r of [...검사].sort((a, b) => a.url.localeCompare(b.url))) {
  console.log(`  ${String(r.출구).padStart(2)}개 출구  ${r.url}`);
}

if (실패.length > 0) {
  console.error(`\n검증 실패 ${실패.length}건:`);
  for (const f of 실패) console.error(`  [${f.code}] ${f.url} — ${f.msg}`);
  process.exit(1);
}

console.log(`\n통과: ${pages.length}/${pages.length}. D1~D5 · noindex · img alt 위반 0건.`);
