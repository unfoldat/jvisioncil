# jvisioncil — 프로젝트 지침

## 보안 절차

**새 기능·필드·컬렉션·외부 연동을 추가할 때는 OWASP Top 10 + KISA 홈페이지 취약점 진단·제거 가이드 21항목을 이중 대조한다.** 판정 근거·현재 상태: [base/판정-보안기준.md](base/판정-보안기준.md)(OWASP), [base/판정-KISA21항목.md](base/판정-KISA21항목.md)(KISA). "해당없음" 판정도 명시적으로 남긴다 — DB·서버 실행 코드·자체 인증 등이 추가되면 재검토 트리거가 된다.

## 접근성 절차

**표·멀티미디어·다단계 폼 등 새로운 콘텐츠 유형을 추가할 때는 KWCAG 2.2를 대조한다.** 판정 근거·현재 상태: [base/판정-KWCAG접근성.md](base/판정-KWCAG접근성.md).

## 배포 절차 (재발방지)

**`cms-auth-worker`를 `wrangler deploy`하기 전에 `wrangler.toml`에 `[vars]` 블록이 대시보드 설정과 일치하는지 반드시 확인한다.** `[vars]`가 비어 있으면 배포가 대시보드에서 수동 설정한 환경변수(예: `GITHUB_CLIENT_ID`, `ALLOWED_DOMAINS`)를 전부 지워버린다 — 2026-07-17에 실제로 이 사고로 admin 로그인이 잠시 중단됨(경고 메시지를 무시하고 배포 강행한 게 원인). `GITHUB_CLIENT_SECRET` 같은 진짜 비밀값은 `[vars]`에 절대 쓰지 않고 대시보드 암호화 시크릿으로만 관리 — 이건 배포에 영향받지 않음(확인됨). 근거: [base/판정-보안기준.md](base/판정-보안기준.md) A05, [cms-auth-worker/wrangler.toml](cms-auth-worker/wrangler.toml).
