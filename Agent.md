# PraiseLayout Agent Notes

이 파일은 이 프로젝트에서 앞으로 작업을 시작할 때 가장 먼저 읽기 위한 컨텍스트 문서다.

## 프로젝트 요약

- 서비스명: 찬양팀 콘티 제작기
- 목적: 찬양팀이 예배 콘티, 곡 정보, Key, 전조 Key, 흐름 메모, 악보 이미지/PDF를 한 화면에서 정리하고 A3 PDF 또는 JPG로 다운로드하는 무료 웹 도구
- 저장소: `MinseokRyu96/praise-layout`
- 배포: GitHub `main` 브랜치 푸시 시 Vercel 자동 배포
- 앱 형태: 프레임워크 없는 정적 웹 앱
- 주요 파일:
  - `index.html`: 앱 화면, SEO 메타, AdSense 스크립트, 캐시 버전 쿼리
  - `styles.css`: 전체 반응형 UI, 출력 미리보기, 모바일 최적화
  - `src/app.js`: 상태 관리, 렌더링, 업로드, 마커, PDF/JPG 다운로드 로직
  - `scripts/build.js`: 정적 파일을 `dist/`로 복사
  - `api/visit.js`: 외부 방문 시 Discord 웹훅 알림
  - `about.html`, `guide.html`, `privacy.html`, `terms.html`, `contact.html`: SEO/정책/가이드 페이지
  - `ads.txt`, `robots.txt`, `sitemap.xml`: AdSense/SEO 관련 파일

## 기술 구조

- Node 기반 빌드만 사용한다. 프론트엔드 프레임워크는 없다.
- `npm run build`는 `node scripts/build.js`를 실행해서 정적 앱을 `dist/`에 생성한다.
- 로컬 실행은 `node server.js 4175` 또는 `npm run dev`를 사용한다.
- 브라우저 데이터 저장:
  - 콘티 상태: `localStorage` 키 `praise-layout-mvp-v10`
  - 곡명별 Key 기억: `localStorage` 키 `praise-layout-song-key-memory-v1`
  - 업로드 파일 장기 저장: IndexedDB `praise-layout-files`
- `index.html`의 `styles.css?v=...`, `src/app.js?v=...`는 배포 후 캐시 혼선을 줄이기 위한 버전이다. CSS/JS 변경 시 함께 올리는 편이 좋다.

## 현재 주요 기능

- 콘티명, 예배 날짜, 곡 수 설정
- 곡 수는 1곡부터 6곡까지 지원
- 곡 수가 1곡이면 자동으로 1장/세로 방향을 적용
- 곡별 입력:
  - 찬양 이름
  - Key
  - 전조 Key
  - 곡 흐름 메모
  - 악보 이미지/PDF 업로드
- Key 선택지는 메이저 Key만 사용한다.
  - `C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B`
  - `#` 표기는 flat 표기로 자동 정규화한다.
  - `m`이 들어간 minor Key는 목록에서 제거되어 있다.
  - 전조 Key 기본 문구는 `전조없음`이다.
- 악보 업로드:
  - 업로드 후 미리보기 표시
  - hover/focus 시 `X` 삭제 버튼 표시
  - 모바일에서는 hover가 없으므로 삭제 버튼이 항상 보이도록 처리
  - 업로드 파일은 IndexedDB에 저장되어 페이지 이동 후에도 복원된다.
- 악보 마커:
  - `V`, `Ch`, `P.C`, `Br`
  - 악보 위에 추가 가능
  - 드래그 이동 가능
  - 크기 조절 가능
  - hover/focus 시 X 삭제 가능
  - 더블클릭 삭제 지원
  - `Key↑` 마커는 추가하지 않는다. 전조는 곡 정보의 전조 Key 필드로 관리한다.
- 출력:
  - A3 PDF 다운로드
  - 페이지별 JPG 다운로드
  - 파일명은 콘티명 기반
- 모바일:
  - 입력 UI는 모바일 전용으로 재배치되어 있다.
  - 모바일 미리보기는 A3 한 페이지에 여러 곡을 축소해서 보여주지 않고, 악보 슬롯을 곡별 카드처럼 한 장씩 크게 세로 배치한다.
  - PDF/JPG 실제 출력 로직은 데스크톱/인쇄용 레이아웃을 유지한다.

## 디자인/UX 방향

- 작업 도구처럼 조용하고 실용적인 UI를 유지한다.
- 랜딩 페이지 느낌보다 실제 편집 화면이 첫 화면이어야 한다.
- 입력 필드는 모바일에서 가로 overflow가 없어야 한다.
- 카드 안에 카드가 중첩되는 구조는 피한다.
- 버튼/입력 컨트롤은 모바일에서 터치하기 쉬운 높이를 유지한다.
- 악보 미리보기와 마커 편집 영역은 모바일에서 작게 뭉개지지 않도록 우선적으로 보호한다.
- SEO 문구/푸터는 사용자 흐름을 방해하지 않도록 과하게 길게 노출하지 않는다.

## 배포/검증 워크플로

작업 전:

1. `Agent.md`를 먼저 읽는다.
2. `git status --short`로 작업트리 상태를 확인한다.
3. 관련 파일을 `rg`, `sed` 등으로 먼저 읽고 기존 패턴에 맞춘다.

작업 중:

- 수동 파일 편집은 `apply_patch`를 우선 사용한다.
- 사용자가 만든 변경을 되돌리지 않는다.
- UI 변경 시 모바일/데스크톱 반응형 영향을 같이 확인한다.
- 정적 HTML/CSS/JS 구조를 유지하고 불필요한 의존성을 추가하지 않는다.

검증:

- 기본 검증: `npm run build`
- 공백/패치 검증: `git diff --check`
- UI 변경 시 가능하면 로컬 서버 실행 후 브라우저로 확인
  - 예: `node server.js 4175`
  - 확인 항목: 콘솔 에러, 가로 overflow, 버튼/업로드/미리보기 동작

Git:

- 배포에 반영해야 하는 변경은 `main`에 커밋 후 푸시한다.
- 푸시하면 Vercel 자동 배포가 트리거된다.
- 커밋 메시지는 기능 단위로 짧고 명확하게 작성한다.

## 주의할 점

- `dist/`는 빌드 산출물이다. 일반적으로 소스 변경은 루트 HTML/CSS/JS에서 한다.
- AdSense 스크립트와 `ads.txt`는 유지한다.
- Discord 방문 알림은 `api/visit.js`와 Vercel 환경변수 `DISCORD_WEBHOOK_URL`에 의존한다.
- SEO/정책 페이지의 문의 이메일은 `mean.seokk@gmail.com`이다.
- `Key↑`를 마커로 다시 추가하지 않는다.
- Key 목록에 sharp/minor를 다시 늘리지 않는다. 현재는 flat 기반 메이저 Key만 사용한다.
- 모바일 미리보기는 곡별 한 장씩 보여주는 UX가 현재 의도다.
