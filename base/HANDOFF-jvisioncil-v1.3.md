# HANDOFF — 좋은비전 사이트 v1.3 구현

수신: Claude Code (로컬)
근거 문서: 좋은비전-사이트-설계-스펙-v1.3-확정.md (함께 전달 — repo에 base/스펙-사이트-v1.3.md 로 커밋할 것)
저장소: github.com/{계정}/jvisioncil — **현재 빈 repo (코드 없음). 로컬에 기존 작업물 없음. 처음부터 만든다.**
전제: 이 문서의 T1~T6은 "기존 스택 위 증분"으로 작성됐으나, 실제로는 T0에서 스택 자체를 새로 세운다.

---

## 실행 순서 (T0 → T6, 순차)

### T0. 프로젝트 스캐폴딩 (신규 추가)
- jvisioncil repo clone (빈 상태 확인)
- Astro 프로젝트 init (`npm create astro@latest`, 최소 템플릿)
- Sveltia CMS 연동: `/admin` 경로 + config.yml, GitHub OAuth 방식 (sveltia-cms-auth Cloudflare Worker 방식 — 기존 좋은비전 판정에서 PAT 대신 이 방식 채택된 이력 있음, base/에 관련 판정 문서 없으면 새로 작성)
- Content collections 스키마 초기 정의 (notices, partners, donation-reports — §3, §4 스키마 그대로)
- Cloudflare Pages 프로젝트 생성 + 이 repo 연결 (빌드 커맨드: astro build)
- 초기 커밋: `chore: Astro 프로젝트 초기화`
- ⚠️ 정지 지점 P-1: GitHub OAuth Worker 배포 여부/방식 확인 필요 시 보고

### T1. BaseLayout 교체
스펙 §2.2 문서 순서대로 BaseLayout.astro 재구성.
- header: SearchBox(신규, T2) + PhoneLink(신규) → nav(주 메뉴 4: 기관소개·상담안내·후원안내·소식) → main(h1 + breadcrumb + slot + RelatedLinks) → footer(협력기관 그리드 자리 + 연락처)
- PhoneLink: `<a href="tel:{대표번호}">전화 상담: {번호}</a>` + 문구 "본인이 아니어도 됩니다. 가족·지인의 상담 문의를 환영합니다."
  ⚠️ 대표번호 값은 클라이언트 확인 필요 — placeholder로 두고 정지 지점 P1에서 질문.
- title 규약: `{페이지명} – 좋은비전`. h1 = 페이지명 동일 문자열. Layout props로 강제.
- 랜드마크 정확히 4개: search/nav/main/footer. aria-label은 nav에만.
- DOM 순서 = 시각 순서. order/flex-direction:reverse 등으로 시각만 바꾸는 CSS 금지.

### T2. SearchBox + Pagefind
- role="search", input 레이블 "검색 — 현재 위치: {페이지명}" (Layout에서 페이지명 주입)
- Pagefind 통합 (빌드 후 인덱싱, astro 통합 플러그인 사용)
- 사이트 전체에서 input/textarea가 이 검색창 하나뿐인지 확인 — 기존 페이지에 다른 입력창 있으면 정지·보고

### T3. notices 컬렉션 (소식)
스펙 §3.1 스키마. Zod: title, date, org(string 배열, 최소 1), url(optional), body(optional).
- url 있음 → 목록에서 외부 직행. 링크 텍스트 템플릿 자동 조립: `[{org[0]}] {title} (외부 사이트, 새 탭에서 열림)` — "(새 탭에서 열림)" 텍스트는 a 태그 내부
- url 없음 → 내부 상세 페이지 생성. body 이미지 alt 필수 (Sveltia 이미지 위젯 required 설정)
- 목록 페이지: h1 직하에 태그 필터 행(정적 링크, [전체] + 글 2건 이상 org만) → h2 "소식 목록"
- `/소식/태그/{org}/` 정적 페이지 자동 생성 (getStaticPaths). h1: "소식 — {org}". 상단에 partners에서 desc/when 주입(T4), 하단 글 목록
- JS 필터링 구현 금지 — 전부 정적 페이지

### T4. partners + donation-reports 컬렉션
- partners: {name, url, logo(optional), desc, when}. footer 그리드(정적, 자동 회전·캐러셀 금지) + 각 로고/이름 → 해당 태그 페이지 링크. 태그 페이지 상단에 desc/when 렌더
- donation-reports: {year, file}. Sveltia 파일 위젯(PDF). 후원안내 하위 섹션 "기부금 사용내역"에 연도 내림차순 목록. 링크 텍스트: "{year}년 기부금 사용내역 (PDF)"
- ⚠️ partners 초기 데이터(기관명·url·desc·when)는 클라이언트 제공 필요 — 스키마와 템플릿만 만들고 샘플 1건, 정지 지점 P2에서 목록 요청

### T5. RelatedLinks (전이표)
- props: `{ links: {label: string, href: string}[] }`
- 렌더: `<h2>여기서 갈 수 있는 곳</h2>` + ul. 이 h2가 main의 마지막 h2가 되도록 Layout에서 위치 보장
- 페이지 타입별 기본 links를 스펙 §4 표대로 상수 정의, 페이지에서 오버라이드 가능
- 막다른 페이지 금지: links 빈 배열이면 빌드 에러

### T6. 검증 스크립트 (빌드 게이트)
빌드 후 dist HTML 스캔하는 스크립트 작성, CI(기존 Cloudflare Pages 빌드)에 편입:
- D1: 페이지당 input/textarea === 1 (검색창)
- D2: 마지막 h2 텍스트 === "여기서 갈 수 있는 곳"
- D3: title 패턴 `.+ – 좋은비전` && h1 === title 페이지명부
- D4: 랜드마크 role 4종 각 1개 이하
- D5: RelatedLinks 빈 페이지 0
실패 시 빌드 실패 처리.

---

## 커밋 규약
- 태스크 단위 커밋: `feat(T{n}): {한 줄}`
- 스펙 문서 커밋: `docs: 사이트 설계 스펙 v1.3`
- 완료 시 상태 커밋: `state(jvisioncil): 설계완료 → 구현중` — meta/state.json이 repo에 없으면 docking-station 쪽 작업이므로 생략하고 보고만

## 금지 목록
- localStorage/sessionStorage/쿠키 사용 금지 (무보관 원칙 + 접근성)
- JS 기반 콘텐츠 필터링·무한스크롤·캐러셀·자동 회전 금지
- 검색창 외 입력 요소 추가 금지
- 주 메뉴 항목명·"여기서 갈 수 있는 곳" 표제 임의 변경 금지 (라벨 동결)
- header~주 메뉴 구간에 동적 콘텐츠 배치 금지
- DB·서버 기능 도입 금지
- **내부 링크에 도메인 하드코딩 금지** — 루트상대(`/소식/`)만. canonical/OG는 astro.config `site` 값에서 도출

## 배포 단계 (연습 → 실도메인)
- 현재: 연습 주소로 배포 (pages.dev 또는 지정 서브도메인). **전 페이지 `<meta name="robots" content="noindex">` 적용** — 연습 주소가 검색엔진에 색인되면 실도메인이 중복 콘텐츠 취급됨
- 실도메인(jvisioncil.or.kr) 전환 시: Pages custom domain 추가 + astro.config site 변경 + noindex 제거. 이 3개가 전환의 전부 — 코드 수정 없어야 정상
- noindex 제거는 별도 커밋으로 (실수 방지 추적)

## 정지 지점 (물어보고 진행)
- P0: 연습 배포 주소 확정 (pages.dev 기본 vs cartosheaf 서브도메인 등 — 독수리 지정)
- P1: 대표 전화번호 실값
- P2: partners 초기 목록 (기관명·url·desc·when)
- P3: 기존 페이지에 검색창 외 입력 요소 발견 시 (제거 판정 필요)
- P4: T6 검증에서 기존 페이지 대량 실패 시 (일괄 수정 전 보고)

## 완료 보고 형식
- T별 커밋 해시
- T6 검증 결과 (통과/실패 페이지 수)
- 정지 지점 발생 내역
- 남은 것: D9(센스리더 실측)는 독수리 수동 — 테스트 절차 3줄로 안내문 출력할 것
