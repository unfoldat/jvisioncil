// 빌드 게이트 (2026-07-21 최종 디자인 반영으로 전면 재작성).
// 이전 계약(검색창 1개뿐인 편집창, "여기서 갈 수 있는 곳" 전이표, 랜드마크 1개 초과 금지,
// 협력기관 그리드 footer 전용)은 이번 디자인(글자 배율 컨트롤·모바일 메뉴 토글·헤더/푸터
// 이중 nav·본문 내 협력기관 배너)과 구조적으로 맞지 않아 폐기했다 — 오래된 계약을 억지로
// 통과시키는 게 아니라, 지금 디자인이 실제로 지켜야 할 것을 다시 정의한다.
// 실행: npm run verify (build 후 자동 실행)
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';

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
// network-orgs는 실제 협력기관만 담으므로(좋은비전은 소식의 발행 주체로 별도 관리) 전부 대조 대상.
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
  const footer = html.split(/<footer[^>]*>/)[1]?.split('</footer>')[0] ?? '';

  // E1. 편집창은 검색창 + 글자 배율 슬라이더, 정확히 2개(고정 계약).
  const inputs = [...html.matchAll(/<(input|textarea)\b/g)].length;
  if (inputs !== 2) fail('E1', `입력 요소 ${inputs}개 (검색창+글자배율 슬라이더 2개여야 함)`);

  // E2. search 랜드마크 정확히 1개.
  const searchCount = [...html.matchAll(/role=["']search["']/g)].length;
  if (searchCount !== 1) fail('E2', `search 랜드마크 ${searchCount}개 (1개여야 함)`);

  // E3. main·footer 랜드마크 각 정확히 1개.
  for (const [name, re] of [['main', /<main\b/g], ['footer', /<footer\b/g]]) {
    const n = [...html.matchAll(re)].length;
    if (n !== 1) fail('E3', `랜드마크 ${name} ${n}개 (1개여야 함)`);
  }

  // E4. nav 랜드마크가 여럿이면 각자 고유한 aria-label을 가져야 함(중복 라벨 금지).
  const navLabels = [...html.matchAll(/<nav\b[^>]*aria-label=["']([^"']+)["']/g)].map((m) => m[1]);
  const navTags = [...html.matchAll(/<nav\b/g)].length;
  if (navLabels.length !== navTags) fail('E4', `aria-label 없는 nav가 있음 (nav ${navTags}개 중 라벨 ${navLabels.length}개)`);
  const dupNav = navLabels.filter((l, i) => navLabels.indexOf(l) !== i);
  if (dupNav.length > 0) fail('E4', `nav aria-label 중복: ${[...new Set(dupNav)].join(', ')}`);

  // E5. h1은 main 안에 정확히 1개(문자열이 title 페이지명과 같을 필요는 없음 —
  // 이번 디자인은 hero 카피 h1을 허용).
  const h1s = [...main.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  if (h1s.length !== 1) fail('E5', `h1 ${h1s.length}개 (1개여야 함)`);

  // E6. title 형식만 검사: "{페이지명} – 좋은비전".
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
  if (!/^.+ – 좋은비전$/.test(title)) fail('E6', `title 형식 위반: "${title}"`);

  // 연습 배포: 전 페이지 noindex
  if (!/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    fail('noindex', '연습 배포인데 noindex 메타가 없음');
  }

  // 이미지 alt 필수 (변화 없음).
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
  for (const img of imgs) {
    if (!/\salt=/.test(img[0])) fail('alt', `alt 없는 이미지: ${img[0].slice(0, 60)}`);
  }

  // E7. 막다른 페이지 방지: header 주 메뉴(6개) + footer 메뉴가 항상 존재.
  const mainNavLinks = [...html.matchAll(/<nav\b[^>]*aria-label=["']주 메뉴["'][^>]*>[\s\S]*?<\/nav>/g)];
  if (mainNavLinks.length !== 1) fail('E7', `주 메뉴 nav ${mainNavLinks.length}개 (1개여야 함)`);
  const footerNavLinks = [...footer.matchAll(/<nav\b[^>]*aria-label=["']푸터 메뉴["'][^>]*>([\s\S]*?)<\/nav>/g)];
  if (footerNavLinks.length !== 1 || [...footerNavLinks[0][1].matchAll(/<a\s[^>]*href=/g)].length === 0) {
    fail('E7', '푸터 메뉴 링크 0개 (막다른 페이지)');
  }

  // PARTNER-URL. 협력기관 배너가 렌더링된 곳(본문 어디든)에서, 배지 목적지가
  // 소스(url 유무)와 일치하는지 대조. 위치는 더 이상 footer로 고정하지 않는다
  // (이번 디자인은 기관소개·홈 본문에 배치) — 정합성만 검사.
  if (html.includes('partner-banner')) {
    for (const org of networkOrgs) {
      if (!org.name) continue;
      const bannerMatch = html.match(
        new RegExp(
          `<(a|span)\\s[^>]*class="partner-banner"[^>]*>((?:(?!</\\1>)[\\s\\S])*?${escapeRegExp(org.name)}(?:(?!</\\1>)[\\s\\S])*?)</\\1>`,
        ),
      );
      if (!bannerMatch) {
        fail('PARTNER', `"${org.name}" 배지가 없음`);
        continue;
      }
      const fullTag = html.slice(bannerMatch.index, bannerMatch.index + bannerMatch[0].length);
      const aHref = bannerMatch[1] === 'a' ? fullTag.match(/href="([^"]*)"/)?.[1] : undefined;
      if (org.url) {
        if (!aHref) fail('PARTNER', `"${org.name}": url이 있는데 배지가 링크가 아님`);
        else if (aHref !== org.url) {
          fail('PARTNER', `"${org.name}": 배지가 "${aHref}"로 나감 (기대값 "${org.url}")`);
        }
      } else if (bannerMatch[1] === 'a') {
        fail('PARTNER', `"${org.name}": url이 없는데 배지가 링크로 렌더링됨 (텍스트만이어야 함)`);
      }
    }
  }

  검사.push({ url, inputs, h1: h1s[0] ?? '(없음)' });
}

console.log(`검사 페이지 ${pages.length}개 (/admin 제외)\n`);
for (const r of [...검사].sort((a, b) => a.url.localeCompare(b.url))) {
  console.log(`  입력 ${r.inputs}개  h1="${r.h1}"  ${r.url}`);
}

if (실패.length > 0) {
  console.error(`\n검증 실패 ${실패.length}건:`);
  for (const f of 실패) console.error(`  [${f.code}] ${f.url} — ${f.msg}`);
  process.exit(1);
}

console.log(`\n통과: ${pages.length}/${pages.length}. E1~E7 · noindex · img alt · PARTNER 위반 0건.`);
