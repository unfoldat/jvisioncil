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

### 현재 답 (제안 — 아직 미구현)

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
미결정.

### 근거
- HTML/WCAG: 인터랙티브 요소(`<a>`) 안에 자기 고유 role을 가진 구조적
  요소(heading)를 중첩하는 것은 널리 알려진 위험 패턴 — "카드 제목은
  heading이 링크를 감싸는 구조로" 만드는 게 여러 접근성 가이드에서
  권장되는 표준 카드 패턴이다.
- WCAG 2.5.8(포인터 타겟 최소 크기)·프로젝트 CLAUDE.md 28번(클릭
  영역 44×44px 권장)은 stretched-link 병행 검토의 근거.
- SenseReader 실기(2026-08-20): 위 표 참고. 이 부분만 관찰값이고
  나머지(accname 스펙, Chrome AX tree)는 코드/도구로 확인한 값.

### 상태
**OPEN.** 이번 턴에서는 원인 조사와 후보안 제시까지만 하고 구현하지
않았다. 다음 단계에서 stretched-link 구조를 실제로 적용하고, 빌드 +
Accessibility Tree 확인 후 SenseReader로 "Tab에서 제목이 들리는가"를
재실기하면 DECIDED → VERIFIED로 올린다.
