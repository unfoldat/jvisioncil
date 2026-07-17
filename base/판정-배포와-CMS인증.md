# 판정 — 배포 주소와 CMS 인증 방식

기록일: 2026-07-17 · 근거: HANDOFF-jvisioncil-v1.3.md T0 / 배포 단계 / 정지 지점 P0

## P0. 연습 배포 주소 — 확정

**jvision.cartosheaf.com** (Cloudflare Pages custom domain으로 추가)

- pages.dev 기본 주소가 아니라 cartosheaf 서브도메인을 쓴다. (독수리 지정)
- astro.config `site` = `https://jvision.cartosheaf.com`
- 연습 기간 동안 전 페이지 `<meta name="robots" content="noindex">` — 연습 주소 색인 시 실도메인이 중복 콘텐츠로 취급됨.
- 실도메인(jvisioncil.or.kr) 전환 = ① Pages custom domain 추가 ② astro.config `site` 변경 ③ noindex 제거. 이 3개가 전부이며 코드 수정이 필요하면 설계가 틀린 것이다. noindex 제거는 별도 커밋.

## CMS 인증 — GitHub OAuth (PAT 아님)

Sveltia CMS backend = github, `base_url` = sveltia-cms-auth Cloudflare Worker.
PAT를 브라우저에 두지 않는다. Worker 미배포 상태에서는 `/admin`이 로그인 단계에서 멈춘다 (사이트 본체 빌드·표시에는 영향 없음).

- 상태: **Worker 미배포.** `public/admin/config.yml`의 `base_url`은 placeholder(`https://REPLACE-ME.workers.dev`).
- 남은 일: Worker 배포 + GitHub OAuth App 생성 → `base_url` 실주소로 교체.
