# hyunscsv

**경량 웹 기반 스프레드시트** — Excel 수식 지원, CSV/XLSX 입출력, 브라우저에서 즉시 사용 가능.

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ 기능

- **셀 편집 & 수식**: `SUM`, `AVERAGE`, `COUNT`, `IF`, `VLOOKUP`, `MAX`, `MIN` 등 Excel 수식 완전 지원
- **파일 불러오기**: `.csv`, `.xlsx`, `.xls` 파일을 로컬에서 즉시 열기
- **파일 내보내기**: 현재 시트를 `.csv` 또는 `.xlsx` 형식으로 다운로드
- **서식 지원**: 글꼴, 크기, Bold/Italic/Underline, 텍스트 색상, 셀 배경색, 정렬
- **완전 클라이언트 사이드**: 서버 없이 브라우저에서 모든 처리 완료
- **White Mode**: 깔끔하고 가독성 높은 밝은 테마

---

## 🚀 로컬 실행

### 요구 사항

- [Node.js](https://nodejs.org) 18 이상
- npm 9 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/<your-username>/hyunscsv.git
cd hyunscsv

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

### 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## ☁️ Vercel 배포

### 방법 1 — GitHub 연동 (권장)

1. GitHub에 저장소 Push
2. [vercel.com](https://vercel.com)에서 **"Add New Project"** 클릭
3. GitHub 저장소 선택 후 **Deploy** 클릭
4. 설정 없이 자동 감지 및 배포 완료

### 방법 2 — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (메타데이터, Inter 폰트)
│   ├── page.tsx            # 메인 페이지 (상태 관리)
│   └── globals.css         # 전역 스타일 + White Mode 디자인 시스템
├── components/
│   ├── Header.tsx          # 상단 헤더 (로고, 액션 버튼)
│   ├── Toolbar.tsx         # 서식 툴바
│   ├── SpreadsheetWrapper.tsx  # FortuneSheet 클라이언트 래퍼
│   └── SpreadsheetDynamic.tsx  # dynamic() SSR 방지 래퍼
└── utils/
    ├── fileImport.ts       # CSV/XLSX 파일 파싱 (SheetJS)
    └── fileExport.ts       # CSV/XLSX 파일 내보내기 (SheetJS)
```

---

## 🛠 기술 스택

| 라이브러리 | 버전 | 용도 |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.x | React 프레임워크 |
| [@fortune-sheet/react](https://github.com/ruilisi/fortune-sheet) | 1.x | 스프레드시트 엔진 |
| [xlsx (SheetJS)](https://sheetjs.com) | 0.18.x | CSV/XLSX 파일 처리 |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | 스타일링 |
| [TypeScript](https://typescriptlang.org) | 5.x | 타입 안전성 |

---

## 📄 라이선스

MIT © hyunscsv
