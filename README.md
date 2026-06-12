# PraiseLayout

찬양 콘티의 곡명, 곡 흐름, 보유 악보 파일을 입력해 A3 출력용 레이아웃을 만드는 MVP 프로토타입입니다.

## 현재 구현 범위

- 콘티명, 예배 날짜, 곡 수 설정
- 곡 수에 따른 곡명 입력 슬롯 자동 생성
- 곡별 흐름 입력 및 A3 미리보기 표시
- 곡별 JPG, PNG, PDF 악보 파일 업로드
- A3 가로/세로, 1/2/3/4곡 배치, 여백, 메타 표시 설정
- 브라우저 인쇄 기능을 이용한 A3 PDF 저장
- 모바일 공유를 위한 페이지별 A3 JPG 다운로드
- 브라우저 `localStorage` 기반 콘티 임시 저장

## 실행

로컬 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:4173`을 열면 됩니다.

다른 포트를 쓰고 싶으면 포트 번호를 붙여 실행합니다.

```bash
node server.js 4174
```

## 배포

정적 배포 산출물을 생성합니다.

```bash
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

### Vercel

- Build Command: `npm run build`
- Output Directory: `dist`
- 설정 파일: `vercel.json`

### Netlify

- Build Command: `npm run build`
- Publish Directory: `dist`
- 설정 파일: `netlify.toml`

## 다음 개발 단계

- Next.js App Router 전환
- Supabase Auth, Postgres, Storage 연동
- 콘티 흐름 템플릿 및 반복 구간 프리셋
- 서버 또는 worker 기반 PDF 생성
- 실제 A3 출력 QA 및 프린터 여백 보정
