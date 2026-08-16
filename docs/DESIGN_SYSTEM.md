# 콘티노트 컬러 디자인 시스템

> 버전 1.0 · Light mode · 2026-08-16

콘티노트의 컬러 시스템은 **차분한 틸(Teal)**을 중심으로, 악보를 오래 편집해도 눈이 피로하지 않은 중립색과 명확한 상태색으로 구성한다. 브랜드 컬러는 서비스의 핵심 행동과 선택 상태에 집중해서 사용하고, 악보·문서 콘텐츠 영역은 흰색과 중립색을 우선한다.

## 1. 기본 원칙

1. 컴포넌트에서는 원시 팔레트 값 대신 의미 기반 토큰을 사용한다.
2. 한 화면의 강한 브랜드 컬러는 기본적으로 핵심 행동 하나에 집중한다.
3. 상태는 색만으로 전달하지 않는다. 아이콘, 텍스트, 테두리 또는 패턴을 함께 사용한다.
4. 악보와 인쇄 미리보기 영역에는 브랜드색을 장식적으로 넣지 않는다. 원본 콘텐츠의 가독성과 인쇄 결과를 우선한다.
5. 본문 텍스트와 주요 컨트롤은 WCAG 2.2 AA 명암비를 충족해야 한다.

## 2. 원시 컬러 토큰

원시 토큰은 색상 자체를 정의한다. 제품 코드에서는 가능한 한 다음 절의 의미 기반 토큰을 사용한다.

### Brand — Conti Teal

| 토큰 | 값 | 역할 |
|---|---:|---|
| `brand-50` | `#F0FDFA` | 매우 옅은 브랜드 배경 |
| `brand-100` | `#CCFBF1` | 선택·강조 배경 |
| `brand-200` | `#99F6E4` | 강조 테두리, 장식 |
| `brand-500` | `#14B8A6` | 그래픽·비텍스트 강조 |
| `brand-600` | `#0F766E` | **대표 브랜드 컬러**, 기본 CTA |
| `brand-700` | `#115E59` | 호버, 진한 텍스트, 앱 아이콘 전경 |
| `brand-900` | `#134E4A` | 고대비 브랜드 텍스트 |

### Neutral — Score Gray

| 토큰 | 값 | 역할 |
|---|---:|---|
| `neutral-0` | `#FFFFFF` | 카드, 입력 필드, 악보 배경 |
| `neutral-25` | `#FBFCFE` | 컨트롤 내부의 미세한 구분 |
| `neutral-50` | `#F6F8FB` | 앱 기본 배경 |
| `neutral-100` | `#EEF2F6` | 보조 배경 |
| `neutral-200` | `#E3E8EF` | 기본 구분선·테두리 |
| `neutral-300` | `#C8D2DF` | 호버 테두리 |
| `neutral-500` | `#697586` | 보조 텍스트 |
| `neutral-600` | `#475467` | 설명·내비게이션 텍스트 |
| `neutral-700` | `#344054` | 라벨·강조 본문 |
| `neutral-900` | `#182230` | 제목·기본 본문 |

### Status

| 토큰 | 값 | 역할 |
|---|---:|---|
| `info-600` | `#2563EB` | 정보, 링크, 진행 상태 |
| `info-50` | `#EFF6FF` | 정보 배경 |
| `warning-600` | `#B85F14` | 경고 아이콘·테두리 |
| `warning-800` | `#7C3B0D` | 경고 텍스트 |
| `warning-50` | `#FFF7ED` | 경고 배경 |
| `danger-600` | `#BC3B55` | 오류·삭제 행동 |
| `danger-800` | `#881337` | 오류 텍스트 |
| `danger-50` | `#FFF1F2` | 오류 배경 |
| `success-600` | `#0F766E` | 완료·성공 상태 |
| `success-50` | `#F0FDFA` | 성공 배경 |

성공색은 브랜드색과 공유한다. 성공과 기본 브랜드 강조가 한 화면에 함께 있어 구분이 필요할 때는 체크 아이콘과 “완료” 같은 명시적 레이블을 반드시 추가한다.

## 3. 의미 기반 토큰과 역할

### Surface

| 토큰 | 연결 값 | 사용처 |
|---|---|---|
| `color-bg-canvas` | `neutral-50` | 앱 전체 배경 |
| `color-bg-surface` | `neutral-0` | 카드, 패널, 입력 필드 |
| `color-bg-subtle` | `neutral-25` | 보조 컨트롤, 묶음 영역 |
| `color-bg-brand-subtle` | `brand-50` | 선택 항목, 온보딩 강조 |
| `color-bg-score` | `neutral-0` | 악보·인쇄 미리보기 전용 |

### Content

| 토큰 | 연결 값 | 사용처 |
|---|---|---|
| `color-text-primary` | `neutral-900` | 제목, 본문, 핵심 데이터 |
| `color-text-secondary` | `neutral-600` | 설명, 메타데이터 |
| `color-text-muted` | `neutral-500` | 보조 정보, 플레이스홀더 |
| `color-text-brand` | `brand-700` | 링크, 선택된 라벨, 브랜드 문구 |
| `color-text-inverse` | `neutral-0` | 진한 배경 위 텍스트 |

`color-text-muted`는 흰 배경에서는 일반 본문 크기에 사용할 수 있지만, `color-bg-canvas` 위에서는 명암비가 4.5:1 미만이므로 큰 글자나 비필수 메타 정보에만 사용한다. 캔버스 위의 일반 크기 보조 본문에는 `color-text-secondary`를 사용한다.

### Border & Focus

| 토큰 | 연결 값 | 사용처 |
|---|---|---|
| `color-border-default` | `neutral-200` | 카드·필드 기본 테두리 |
| `color-border-hover` | `neutral-300` | 호버 상태 |
| `color-border-brand` | `brand-600` | 선택·활성 상태 |
| `color-focus-ring` | `brand-600` | 키보드 포커스 링 |

### Action

| 토큰 | 연결 값 | 사용처 |
|---|---|---|
| `color-action-primary` | `brand-600` | 저장, 내보내기 등 핵심 CTA |
| `color-action-primary-hover` | `brand-700` | 핵심 CTA 호버·누름 |
| `color-action-primary-text` | `neutral-0` | 핵심 CTA 레이블 |
| `color-action-secondary` | `neutral-0` | 보조 버튼 배경 |
| `color-action-secondary-text` | `neutral-900` | 보조 버튼 레이블 |
| `color-action-danger` | `danger-600` | 삭제·파괴적 행동 |

### Feedback

| 토큰 | 연결 값 | 사용처 |
|---|---|---|
| `color-info-bg` / `color-info` | `info-50` / `info-600` | 안내 배너, 도움말 |
| `color-warning-bg` / `color-warning` | `warning-50` / `warning-800` | 파일·인쇄 경고 |
| `color-danger-bg` / `color-danger` | `danger-50` / `danger-600` | 오류, 삭제 확인 |
| `color-success-bg` / `color-success` | `success-50` / `success-600` | 저장·내보내기 완료 |

## 4. 사용 가이드

### 대표 브랜드 컬러

- `brand-600`은 주요 버튼, 현재 선택된 도구, 진행 표시 등 **사용자의 다음 행동**에 사용한다.
- 큰 면적의 배경에는 `brand-50` 또는 `brand-100`을 사용한다. `brand-600`을 화면 전체 배경으로 사용하지 않는다.
- 한 카드 안에 기본 CTA가 여러 개라면 가장 중요한 하나만 채움 버튼으로 만들고 나머지는 보조 또는 고스트 버튼으로 낮춘다.
- 앱 아이콘과 마케팅 그래픽에서는 `brand-600`, `brand-700`, `neutral-0`을 중심으로 사용해 제품 UI와 같은 인상을 유지한다.

### 악보·편집 화면

- 악보 캔버스는 항상 `color-bg-score`를 사용한다.
- 구획선과 페이지 경계는 `neutral-200`으로 표시하고, 선택된 악보나 편집 핸들에만 브랜드색을 사용한다.
- 코드, 곡명, 콘티 순서처럼 인쇄될 정보는 기본적으로 `neutral-900`을 사용한다.
- 인쇄 CSS에서는 상태색, 그림자, 선택 표시를 제거하고 흑백에서도 구조가 유지되게 한다.

### 버튼과 인터랙션

- Primary: `brand-600` 배경 + 흰색 텍스트. 호버·누름은 `brand-700`.
- Secondary: 흰색 배경 + `neutral-200` 테두리 + `neutral-900` 텍스트.
- Selected: `brand-50` 배경 + `brand-600` 테두리 + `brand-700` 텍스트.
- Destructive: 기본 상태에서는 텍스트 또는 아웃라인 형태를 우선하고, 최종 확인 행동에만 `danger-600` 채움 버튼을 사용한다.
- Disabled: 투명도만 낮추지 말고 커서·아이콘·레이블로 비활성 상태를 함께 전달한다.

## 5. 접근성 및 컬러 조합 규칙

기준은 WCAG 2.2 AA다. 일반 텍스트는 최소 `4.5:1`, 큰 텍스트(24px 이상 또는 18.66px 이상 굵은 글꼴)는 최소 `3:1`, UI 경계와 의미 있는 그래픽은 최소 `3:1`을 목표로 한다.

### 승인된 주요 조합

| 전경 | 배경 | 명암비 | 허용 범위 |
|---|---|---:|---|
| `#182230` | `#FFFFFF` | `16.03:1` | 모든 텍스트 |
| `#697586` | `#FFFFFF` | `4.68:1` | 일반 텍스트 이상 |
| `#FFFFFF` | `#0F766E` | `5.47:1` | Primary 버튼의 모든 텍스트 |
| `#FFFFFF` | `#115E59` | `7.58:1` | 호버 버튼의 모든 텍스트 |
| `#115E59` | `#F0FDFA` | `7.27:1` | 선택·강조 영역의 모든 텍스트 |
| `#7C3B0D` | `#FFF7ED` | `7.95:1` | 경고 메시지의 모든 텍스트 |
| `#FFFFFF` | `#BC3B55` | `5.39:1` | 위험 버튼의 모든 텍스트 |
| `#FFFFFF` | `#2563EB` | `5.17:1` | 정보 버튼·배지의 모든 텍스트 |

### 금지 또는 제한 조합

- 흰색 텍스트 + `warning-600` (`#B85F14`)은 `4.48:1`로 일반 텍스트 AA 기준에 미달한다. 경고 채움 버튼에는 더 어두운 색을 쓰거나 큰 텍스트로 제한한다.
- `neutral-500` + `neutral-50`은 `4.40:1`이다. 일반 크기 본문에 사용하지 않는다.
- `brand-500` 위의 흰색 텍스트는 사용하지 않는다. `brand-500`은 아이콘, 차트, 장식 등 비텍스트 강조에 제한한다.
- `brand-100`, `warning-50`, `danger-50` 같은 옅은 배경 위에 흰색 텍스트를 사용하지 않는다.
- 오류와 성공을 빨강·틸만으로 구분하지 않는다. 아이콘, 문구, 위치 또는 형태 차이를 함께 제공한다.
- 플레이스홀더는 필수 지시사항을 전달하는 수단으로 사용하지 않는다.

## 6. CSS 변수 예시

```css
:root {
  color-scheme: light;

  /* Raw palette */
  --conti-brand-50: #f0fdfa;
  --conti-brand-100: #ccfbf1;
  --conti-brand-200: #99f6e4;
  --conti-brand-500: #14b8a6;
  --conti-brand-600: #0f766e;
  --conti-brand-700: #115e59;
  --conti-brand-900: #134e4a;

  --conti-neutral-0: #ffffff;
  --conti-neutral-25: #fbfcfe;
  --conti-neutral-50: #f6f8fb;
  --conti-neutral-100: #eef2f6;
  --conti-neutral-200: #e3e8ef;
  --conti-neutral-300: #c8d2df;
  --conti-neutral-500: #697586;
  --conti-neutral-600: #475467;
  --conti-neutral-700: #344054;
  --conti-neutral-900: #182230;

  --conti-info-50: #eff6ff;
  --conti-info-600: #2563eb;
  --conti-warning-50: #fff7ed;
  --conti-warning-600: #b85f14;
  --conti-warning-800: #7c3b0d;
  --conti-danger-50: #fff1f2;
  --conti-danger-600: #bc3b55;
  --conti-danger-800: #881337;

  /* Semantic tokens */
  --color-bg-canvas: var(--conti-neutral-50);
  --color-bg-surface: var(--conti-neutral-0);
  --color-bg-subtle: var(--conti-neutral-25);
  --color-bg-brand-subtle: var(--conti-brand-50);
  --color-bg-score: var(--conti-neutral-0);

  --color-text-primary: var(--conti-neutral-900);
  --color-text-secondary: var(--conti-neutral-600);
  --color-text-muted: var(--conti-neutral-500);
  --color-text-brand: var(--conti-brand-700);
  --color-text-inverse: var(--conti-neutral-0);

  --color-border-default: var(--conti-neutral-200);
  --color-border-hover: var(--conti-neutral-300);
  --color-border-brand: var(--conti-brand-600);
  --color-focus-ring: var(--conti-brand-600);

  --color-action-primary: var(--conti-brand-600);
  --color-action-primary-hover: var(--conti-brand-700);
  --color-action-primary-text: var(--conti-neutral-0);
  --color-action-secondary: var(--conti-neutral-0);
  --color-action-secondary-text: var(--conti-neutral-900);
  --color-action-danger: var(--conti-danger-600);

  --color-info-bg: var(--conti-info-50);
  --color-info: var(--conti-info-600);
  --color-warning-bg: var(--conti-warning-50);
  --color-warning: var(--conti-warning-800);
  --color-danger-bg: var(--conti-danger-50);
  --color-danger: var(--conti-danger-600);
  --color-success-bg: var(--conti-brand-50);
  --color-success: var(--conti-brand-600);
}

.button-primary {
  background: var(--color-action-primary);
  color: var(--color-action-primary-text);
}

.button-primary:hover,
.button-primary:active {
  background: var(--color-action-primary-hover);
}

.button-primary:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.is-selected {
  border-color: var(--color-border-brand);
  background: var(--color-bg-brand-subtle);
  color: var(--color-text-brand);
}

.message-warning {
  border-left: 4px solid var(--conti-warning-600);
  background: var(--color-warning-bg);
  color: var(--color-warning);
}
```

## 7. 적용 체크리스트

- [ ] 컴포넌트에 HEX 값을 직접 쓰지 않고 의미 기반 토큰을 사용했는가?
- [ ] 한 화면에서 Primary 버튼의 우선순위가 명확한가?
- [ ] 일반 텍스트의 명암비가 4.5:1 이상인가?
- [ ] 포커스 상태가 색상과 외곽선으로 분명하게 보이는가?
- [ ] 성공·경고·오류가 색 이외의 정보로도 구분되는가?
- [ ] 악보와 인쇄 미리보기가 흑백에서도 읽히는가?
- [ ] 선택·호버·비활성 상태를 실제 iPad 화면에서 확인했는가?

## 8. 운영 규칙

- 원시 색상이 바뀌어도 컴포넌트 코드는 수정하지 않도록 의미 기반 토큰 연결만 변경한다.
- 새로운 색상을 추가하기 전에 기존 토큰으로 목적을 표현할 수 있는지 먼저 확인한다.
- 다크 모드는 별도 팔레트가 아니라 동일한 의미 기반 토큰의 테마 매핑으로 추가한다.
- 디자인 파일, iPad 앱, 웹 앱에서 토큰 이름을 동일하게 유지한다.
- 팔레트 변경 시 대표 조합의 명암비를 다시 측정하고 이 문서의 표와 버전을 함께 갱신한다.
