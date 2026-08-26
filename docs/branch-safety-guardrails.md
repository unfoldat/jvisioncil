# 브랜치 안전 가드레일

CMS(Sveltia)가 `public/admin/config.yml`의 `backend.branch`에 커밋하는 구조라,
브랜치 실험 중 이 값을 안 맞추면 CMS 저장이 실수로 `main`(실제 서비스)에
바로 들어간다. 2026-08-26에 이 사고가 두 번 났다.

## 실제 있었던 사고 2건

1. **기부금 공시 삭제·강사 프로필 생성이 main에 바로 들어감** — 레이아웃
   확인용으로 만든 브랜치(`test/donation-list-width`)의 `config.yml`을
   격리 안 한 채 그 브랜치 프리뷰의 `/admin`을 열어 CMS로 작업 — 그
   브랜치는 코드만 다르고 `backend.branch: main`은 그대로였어서, 저장한
   내용이 전부 실제 `main`에 커밋됐다.
2. **"이 프리뷰는 격리됐다"고 착각** — 격리된 브랜치(`test/home-notice-4`)와
   격리 안 된 브랜치를 같은 세션에서 같이 쓰다 보니, 어느 프리뷰가
   격리 상태인지 헷갈렸다.

## 원칙: 애매하면 임의로 정하지 말고 먼저 확인받는다

작업을 새 브랜치로 분리할지, 기존에 진행 중인 브랜치에 이어서 할지 애매하면
Claude가 임의로 결정하지 않는다 — "관련 없는 작업이니 분리하자"는 판단도
사용자의 실제 작업 맥락(지금 어느 브랜치를 실험 환경으로 쓰고 있는지)을
무시할 수 있다. 먼저 물어본다.

## 절차

### 작업 시작 시
1. 최신 `main`에서 새 브랜치 생성
2. CMS로 실제 콘텐츠를 넣어볼 계획이면, `config.yml`의 `backend.branch`를
   그 브랜치명으로 임시 변경 후 커밋·푸시
3. 프리뷰 링크를 전달할 때 **그 브랜치의 config.yml 격리 상태를 명시적으로
   같이 알린다** — "이 프리뷰는 CMS가 격리돼 있다" 또는 "이 프리뷰는
   레이아웃 확인용이라 CMS는 여전히 main에 커밋된다"를 매번 밝힌다.

### 작업 종료 시(merge 전)
1. 테스트로 넣은 콘텐츠 삭제
2. `config.yml`을 `branch: main`으로 원복
3. 최신 `main`과 동기화(`git pull --ff-only` 또는 `merge`)
4. diff 확인 후 merge

### 파괴적 작업(main 포인터 이동, force push 등) 전
- 항상 백업 브랜치/태그를 먼저 만들고 원격에 푸시해 존재를 확인한다
  (예: `backup/main-before-finalize-YYYYMMDD`)
- `git push --force`가 아니라 `git push --force-with-lease`를 쓴다
  (원격이 예상과 다르게 움직였으면 실패하게)
- `git reset --hard` 같은 명령은 Claude Code 자동 모드에서 승인 프롬프트를
  띄우도록 막혀 있을 수 있다 — 막히면 사용자에게 명시적 재승인을 요청한다

## 참고
2026-08-26 이관 준비 과정에서 실제로 이 절차대로 main을 정리했다 —
`main-before-finalize-20260826` 백업 → main 포인터를 검증된 브랜치로
이동(`--force-with-lease`) → `config.yml` 원복 → CMS 저장 테스트로 최종
확인.
