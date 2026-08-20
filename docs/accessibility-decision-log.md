# 접근성 설계 결정 로그

재사용 가치가 있는 접근성 설계 질문을 항목별로 누적한다. 각 항목은
OPEN → DECIDED → VERIFIED 순으로 상태가 바뀐다. VERIFIED는 실제
SenseReader(또는 다른 실제 스크린리더) 실기로 확인된 뒤에만 붙인다.

---

## 소식 카드의 Tab 탐색에서 제목을 어떻게 보장할 것인가?

### 개발 질문
ARIA로 accessible name을 임의 조립하지 않으면서, 카드 HTML을 어떻게
구성하면 SenseReader의 Tab 탐색에서 글 제목이 링크의 핵심 식별자로
자연스럽게 전달되는가?

### 사용자 목표
소식 목록에서 Tab으로 글을 빠르게 훑고, 제목을 듣고 관심 있는 글만
Enter하여 열 수 있어야 한다.

### 관찰된 실기 (2026-08-20, https://d07c1bad.jvisioncil.pages.dev/)

1. thumbnailAlt 없는 좋은비전 카드, Tab:
   → "작성일 20260819 링크"
2. thumbnailAlt 있는 테스트1번글 카드, Tab:
   → "이것은대체텍스트 작성일 20260819 그래픽 링크"
3. 테스트1번글, 화살표 탐색:
   → "테스트1번글 헤딩3 링크"
   → "이것은목록요약 링크"

### 문제
Native 구조와 브라우저 Accessibility Tree에는 `<h3>` 제목이 링크의
하위 노드로 존재하지만(로컬 accessibility tree 확인 완료), 실제
SenseReader의 Tab 낭독에서는 두 카드 모두 제목이 빠진다. 화살표
탐색에서는 제목이 "헤딩3"으로 별도로 들린다.

### 레이어별 분리 조사

| 레이어 | 확인 방법 | 결과 |
|---|---|---|
| DOM | dist HTML 직접 확인 | `<a><span 사진/><span><span 날짜/><h3>제목</h3><span 요약/></span></a>` — h3가 a의 자손 |
| Link의 computed accessible name (W3C accname 알고리즘 기준) | 스펙상 판단 | 스펙대로면 자손 텍스트를 전부 평탄화(flatten)하므로 제목 텍스트도 포함되어야 함 |
| 브라우저 Accessibility Tree의 link 노드 | 로컬 프리뷰 + accessibility tree 직접 확인(이전 턴) | link 노드의 자식으로 `heading "제목"`이 별도 객체로 노출됨 — 포함은 되어 있음 |
| SenseReader Tab(focus mode) 낭독 | 실제 실기(2026-08-20) | 제목 텍스트 누락. 날짜(및 있으면 그래픽 alt)만 낭독, "링크"만 뒤에 붙음 |
| SenseReader 화살표(virtual cursor) 낭독 | 실제 실기(2026-08-20) | 제목이 "헤딩3"으로 별도로 들림 — 화살표 모드에서는 정상 인식 |

### 원인 진단

DOM·accname 스펙·브라우저 Accessibility Tree 세 레이어 모두 제목을
링크 콘텐츠에 포함시키는데, SenseReader의 Tab 낭독만 제목을 빠뜨린다.
가장 유력한 설명(가설 — SenseReader 벤더 문서로 확정한 것은 아님):
**`<a>` 내부에 자기 고유의 강한 시맨틱 role을 가진 `<h3>`(heading)가
중첩되어 있으면, SenseReader의 Tab/focus-mode 낭독 알고리즘이 그
하위 heading의 텍스트를 링크 이름에 평탄화하지 않고 건너뛰는 것으로
보인다.** 화살표(virtual cursor) 모드는 heading을 별도 정지점으로
정상 인식하는 것과 대조적 — 즉 두 순회 모드가 heading을 다르게
취급하는 SenseReader 자체의 구현 특성으로 추정된다. 이 부분은 코드
분석만으로 완전히 확정할 수 없고, "인터랙티브 요소 안에 heading을
중첩하는 구조는 AT 지원이 갈릴 수 있다"는 것은 접근성 커뮤니티에서
이미 알려진 위험 패턴이라는 점과 일치한다.

### 설계 원칙
- Semantic HTML 우선
- Native role/state 우선
- ARIA는 필요한 경우에만 최소 사용
- 원하는 낭독 문장을 ARIA로 임의 조립하지 않음
- Tab = 빠른 조작/선택, 화살표 = 상세 콘텐츠 탐색
- 링크 목적을 사용자가 판단할 수 있어야 함
- SenseReader 실기를 최종 검증으로 사용

### 현재 답 (구현 완료, 실기 검증 대기)

**heading이 링크를 감싸는 구조(`<h3><a>제목</a></h3>`)로 뒤집는다.**
지금처럼 "링크가 heading을 포함"하는 게 아니라 "heading이 링크를
포함"하게 하면:
- 제목 텍스트가 링크의 유일한/첫 콘텐츠가 되어 Tab 이름에서 빠질
  경로 자체가 없어진다 (heading을 링크의 자손으로 중첩시키는 구조
  자체를 없애므로, 위에서 추정한 SenseReader 특성과 무관하게 안전).
- `<h3>`는 여전히 실제 heading이라 헤딩 탐색(H 키)도 그대로 된다.
- ARIA 추가 없음 — 순수 구조 변경.

다만 이러면 지금의 "카드 전체가 하나의 `<a>`"(사진·날짜·요약까지
전부 클릭 가능) 패턴이 깨진다. 이를 유지하려면 CSS만으로 클릭 영역을
카드 전체로 넓히는 **stretched-link 패턴**을 함께 검토해야 한다
(`.notice-card { position: relative }` + 제목 `<a>`에
`::after { position:absolute; inset:0 }`로 시각적 클릭 영역만 카드
전체로 확장, 링크의 실제 텍스트/접근 가능 이름은 제목 하나만 유지).
사진·날짜·요약은 더 이상 링크 안에 있지 않으므로 화살표 탐색에서는
카드 안의 개별 콘텐츠로 순서대로 읽히고(문서 흐름 유지), Tab에서는
제목만 링크로 잡힌다.

### 채택한 HTML 패턴

```html
<li class="notice-card">
  <article>
    <span class="notice-card-photo"><img alt="..."></span>
    <span class="notice-card-body">
      <span class="notice-card-meta"><time datetime="...">...</time></span>
      <h3><a class="notice-card-link" href="...">제목</a></h3>
      <p class="notice-card-summary">요약</p>
    </span>
  </article>
</li>
```

카드 전체를 감싸던 `<a>`를 없애고, 실제 Tab 정지점/링크는 `<h3>` 안의
제목 `<a>` 하나뿐이다. 카드 전체 클릭 UX는 새 JS·role·tabindex 없이
CSS만으로 복원(`.notice-card-link::after { position:absolute; inset:0 }`
+ `.notice-card { position:relative }`). 포커스 시 카드 전체에 시각
피드백을 주기 위해 `.notice-card:has(.notice-card-link:focus-visible)`로
전역 `:focus-visible` 색/굵기를 카드 테두리에도 겹쳐 그린다(새 색상
추가 없음, 기존 스타일 재사용).

### 근거
- HTML/WCAG: 인터랙티브 요소(`<a>`) 안에 자기 고유 role을 가진 구조적
  요소(heading)를 중첩하는 것은 널리 알려진 위험 패턴 — "카드 제목은
  heading이 링크를 감싸는 구조로" 만드는 게 여러 접근성 가이드에서
  권장되는 표준 카드 패턴이다.
- WCAG 2.5.8(포인터 타겟 최소 크기)·프로젝트 CLAUDE.md 28번(클릭
  영역 44×44px 권장)은 stretched-link 병행 채택의 근거.
- SenseReader 실기(2026-08-20, 문제 발견 시점): 위 표 참고. 이 부분만
  관찰값이고 나머지(accname 스펙, Chrome AX tree)는 코드/도구로 확인한
  값.
- 구현 후 로컬 검증(코드/도구 확인, SenseReader 아님):
  - 빌드 dist HTML — `<h3><a class="notice-card-link">제목</a></h3>`
    구조, 카드당 실제 `<a href>` 1개, aria-label/aria-labelledby/
    "소식 상세보기" 전부 0건.
  - Chrome Accessibility Tree(로컬 프리뷰) — `heading "제목"` 안에
    `link "제목"`(이름=제목 텍스트만), thumbnailAlt 있으면 `image
    "alt텍스트"`가 별도 노드로, 없으면 이미지 자체가 트리에서 제외.
  - 실제 키보드 Tab(claude-in-chrome computer 도구, JS `.focus()`
    아님) — 카드1 제목 링크 → Tab 1회 → 카드2 제목 링크로 정확히
    이동(중간 정지점 없음), `document.activeElement.matches(':focus-visible')
    === true`, 상위 `.notice-card`의 computed `outline`이
    `rgb(26,21,18) solid 3px`로 실제 적용됨(카드 전체 focus 표시 확인).
  - `elementFromPoint`로 사진 영역(링크 밖 시각 영역) 클릭 시뮬레이션
    — 실제로 `.notice-card-link` 엘리먼트가 히트됨(stretched-link
    정상 작동, 카드 어디를 눌러도 제목 링크가 눌림).

### 최종 SenseReader 실기 (2026-08-20)

- 좋은비전 카드 Tab → "좋은비전홈페이지가개설되었습니다 헤딩3 링크"
- 다음 Tab, 테스트1번글 → "테스트1번글 헤딩3 링크"
- 테스트1번글 화살표 탐색 → 카드 내부 제목/요약 등 세부 콘텐츠 접근 확인

Tab에서 제목이 링크의 핵심 식별자로 정확히 전달됨을 확인. 이전
whole-card `<a>` 구조에서 Tab 낭독 시 제목이 누락되던 문제가
`<h3><a>` 구조로 해결됨을 실기로 검증.

### 상태
**VERIFIED (2026-08-20).** 코드/빌드/Accessibility Tree/실제 키보드
Tab/SenseReader 실기 전부 확인 완료. 카드 접근성 작업 종료.

---

## 사이트 공통 "본문으로 바로가기"는 어디로 보내야 하는가?

### 개발 질문
반복되는 header/GNB를 건너뛰는 사이트 공통 Skip to Main Content
링크는, 페이지마다 다른 "실제 본문 콘텐츠"로 이동시켜야 하는가,
아니면 main 랜드마크 자체로 보내야 하는가?

### 배경
소식 상세 페이지에만 `data-body-start` + `firstElementChild` 특례를
추가해 h1이 아니라 본문 첫 콘텐츠로 착지시키려 했으나, 실기에서 href
(`#main-content`)와 실제 focus 대상(무id 요소)이 어긋나며 AT가 h1
쪽으로 스스로 보정하는 것으로 보이는 현상이 발견됨. 이를 계기로
"이 링크는 article 본문 이동 기능이 아니라 사이트 공통 Skip to Main
패턴"이라는 재정의가 나왔다.

### 비교한 두 후보
- A안: main 내부 첫 h1으로 focus (기존 구현)
- B안: main#main-content 자신으로 focus (라이브 목업
  design-mockup.jvisioncil.pages.dev/plan3#/lecture 실측 패턴)

### 조사 결과 (현재 HEAD 빌드 dist 기준, 추측 아님)
7개 페이지 유형 중 **5개(센터소개·전문상담·강의 안내·소식 목록·후원)에서
h1 직전에 `<p class="eyebrow"><span class="pill">카테고리명</span></p>`
콘텐츠가 실존**하며, A안(h1 직행)은 이를 매번 건너뛴다. 홈·소식상세
2유형만 h1 앞에 실질 콘텐츠가 없다. 라이브 목업에서 skip-link 활성화
후 `document.activeElement === main#main-content`(`tabindex="-1"`)로
확인됨 — B안이 이미 검증된 기준선.

### 설계 원칙
- href 목적지와 실제 focus 목적지를 일치시킨다
- 페이지별 예외를 만들지 않는다
- 기존 DOM 순서(eyebrow → h1 → 본문)를 보존한다
- 페이지 로드 시 자동 focus는 하지 않는다(첫 Tab이 스킵 링크에
  자연스럽게 닿아야 함 — 목업의 "H1 자동 focus"는 이 흐름을 방해해
  채택하지 않음)

### 현재 답 — 채택한 패턴 (구현 완료, SenseReader 실기 대기)

```js
document.querySelector('.skip')?.addEventListener('click', (e) => {
  const main = document.getElementById('main-content');
  if (!main) return;
  e.preventDefault();
  main.focus();
  window.scrollTo(0, main.getBoundingClientRect().top + window.scrollY - 8);
});
```

`<main id="main-content" tabindex="-1">`는 모든 페이지에 이미 정적으로
존재 — 새 tabindex 부여 로직 불필요. `data-body-start`/`firstElementChild`/
첫 heading 탐색/동적 tabindex 부여를 전부 제거했다. 소식 상세의
`.post-content` wrapper도 스타일링에 쓰이지 않아 함께 제거(스타일은
`.post-body :global(p/img)` 자손 선택자라 wrapper 유무와 무관).

### 근거
- WCAG: A/B 둘 다 2.4.1(Bypass Blocks) 위반 아님 — 표준 문제가 아니라
  UX/IA 선택 문제.
- href/focus target 일치: B만 일치. A는 소식상세 특례와 같은 종류의
  구조적 불일치가 내재돼 있었음(이번에 제거).
- 코드 단순성: B는 새 tabindex 부여·heading 탐색 로직이 전부 불필요.
- 구현 후 로컬 검증(코드/도구 확인, SenseReader 아님):
  - dist HTML — `data-body-start`, `.post-content` 전부 0건 확인
  - synthetic click dispatch(claude-in-chrome) — 센터소개·소식상세
    양쪽에서 `document.activeElement === main#main-content`,
    `tabindex === "-1"` 확인
  - Chrome Accessibility Tree — 센터소개: `region > generic "센터소개"
    → heading "보는 방법은..." → 소개 문단들` 순서 보존 확인.
    소식상세: `article > region(heading "테스트1번글" → 작성일) >
    region(본문 → 이미지 → "소식 목록으로 돌아가기")` 순서 보존 확인
  - 실제 키보드 Return 키로는 이 자동화 환경에서 클릭이 트리거되지
    않는 현상이 있었음(이전에도 확인된 자동화 도구 자체의 한계로
    추정) — 그래서 synthetic click dispatch로 핸들러 로직만 별도 검증,
    실제 사용자 키보드 동작은 SenseReader 실기로 확인 필요

### 상태
**DECIDED — SenseReader 실기 대기.** 코드/빌드/dist/Accessibility Tree
레벨은 전부 확인됐다. 센터소개(eyebrow 있는 페이지)와 소식 상세에서
실기(Tab→Enter→main 진입→화살표 2~3회로 eyebrow/제목→본문 순서가
자연스러운지)로 확인되면 VERIFIED로 올린다.
