# CMS 인증 Worker (jvisioncil-cms-auth)

Sveltia CMS(`/admin`)가 GitHub PAT 없이 OAuth로 로그인하게 해주는 Cloudflare Worker.
원본: [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (MIT) — 이 저장소용으로 그대로 복사, 코드 수정 없음.

## 배포됨

- Worker URL: `https://jvisioncil-cms-auth.dkdlvkt244.workers.dev`
- `public/admin/config.yml`의 `backend.base_url`이 이 주소를 가리킨다.

## 재배포 (CLI 한 줄)

```
cd cms-auth-worker
npx wrangler deploy
```

`npx wrangler login`으로 Cloudflare 계정 인증이 먼저 되어 있어야 한다 (브라우저에서 승인 1회).

## 남은 설정 (Cloudflare 대시보드, 코드 아님)

1. GitHub OAuth App 생성: https://github.com/settings/applications/new
   - Authorization callback URL: `https://jvisioncil-cms-auth.dkdlvkt244.workers.dev/callback`
   - 등록 후 Client ID + Client Secret 발급
2. Cloudflare 대시보드 → Workers & Pages → `jvisioncil-cms-auth` → Settings → Variables and Secrets
   - `GITHUB_CLIENT_ID` = Client ID (평문)
   - `GITHUB_CLIENT_SECRET` = Client Secret (**Encrypt** 클릭)
   - `ALLOWED_DOMAINS` = `jvisioncil.pages.dev` (평문, 권장 — 같은 Cloudflare 계정의 다른 사이트가 이 인증기를 도용하지 못하게 제한)
   - Save and deploy
