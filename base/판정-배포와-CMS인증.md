# 판정 — 배포 주소와 CMS 인증 방식

기록일: 2026-07-17 · 근거: HANDOFF-jvisioncil-v1.3.md T0 / 배포 단계 / 정지 지점 P0

## P0. 연습 배포 주소 — 확정 (2026-07-17 수정: 커스텀 도메인 미사용으로 번복)

**jvisioncil.pages.dev** (Cloudflare Pages 기본 도메인. custom domain 연결 안 함)

- 최초 결정(2026-07-17 오전)은 `jvision.cartosheaf.com` custom domain이었으나, 같은 날 커스텀 도메인을 쓰지 않기로 번복. pages.dev 기본 주소로 통일.
- astro.config `site` = `https://jvisioncil.pages.dev`
- 연습 기간 동안 전 페이지 `<meta name="robots" content="noindex">` — 연습 주소 색인 시 실도메인이 중복 콘텐츠로 취급됨.
- meta는 HTML에만 붙는다. 기부금 PDF 등 비HTML까지 덮기 위해 `public/_headers`로 `X-Robots-Tag: noindex, nofollow`를 전 경로에 적용한다.
- robots.txt로 `Disallow: /`는 하지 않는다 — 크롤러가 아예 안 들어오면 noindex 지시를 읽지 못해, 외부 링크가 있을 경우 주소만 검색결과에 뜰 수 있다. "크롤링 허용 + noindex 응답"이 색인을 확실히 막는 조합.
- 실도메인(jvisioncil.or.kr) 전환 = ① Pages custom domain 추가 ② astro.config `site` 변경 ③ noindex 제거(`config.ts`의 `NOINDEX` = false + `public/_headers` 삭제, 한 커밋). 이 3개가 전부이며 코드 수정이 필요하면 설계가 틀린 것이다.

## CMS 인증 — GitHub OAuth (PAT 아님)

Sveltia CMS backend = github, `base_url` = sveltia-cms-auth Cloudflare Worker.
PAT를 브라우저에 두지 않는다. Worker 미배포 상태에서는 `/admin`이 로그인 단계에서 멈춘다 (사이트 본체 빌드·표시에는 영향 없음).

- 상태(2026-07-17 갱신): **Worker 배포 완료.** `cms-auth-worker/`에 원본 그대로 커밋(코드 수정 없음), `npx wrangler deploy`로 재배포 가능.
  - Worker URL: `https://jvisioncil-cms-auth.dkdlvkt244.workers.dev`
  - `public/admin/config.yml`의 `base_url` 실주소로 교체 완료.
- 남은 일 (Cloudflare/GitHub 대시보드 — 코드가 아니라 클릭으로 하는 일이라 독수리가 직접):
  1. GitHub OAuth App 생성 (콜백 `<Worker URL>/callback`) → Client ID·Secret 발급
  2. Cloudflare 대시보드에서 Worker에 `GITHUB_CLIENT_ID`(평문)·`GITHUB_CLIENT_SECRET`(암호화)·`ALLOWED_DOMAINS=jvisioncil.pages.dev`(권장) 등록
  - 절차 상세: `cms-auth-worker/README.md`
- 시크릿(Client Secret)은 대시보드에서만 입력한다 — 커밋·채팅·CLI 인자로 절대 넘기지 않는다 (평문 노출 경로 원천 차단).
