# 진행 내역 상세

`memory.md`의 라우팅 대상 문서. 코드와 git에서 확인된 사실만 기록한다.

## 완료

- **저장소 기본 골격** — `CLAUDE.md`(프로젝트 규칙), `promptLog.md`(프롬프트 기록), `.gitignore`
- **클라이언트 스캐폴드** — Vite + React 템플릿. `client/src/App.jsx`가 `<h1>Hello, GETIT</h1>`만 렌더
- **서버 스캐폴드 + Supabase 연동 코드**
  - `server/index.js` — Express 앱, `dotenv/config` 로딩, 포트 `process.env.PORT || 4000`
  - `server/supabaseClient.js` — anon 클라이언트 `supabase`, 요청별 `createUserClient(accessToken)`
  - `server/middleware/requireAuth.js` — `Authorization: Bearer` 토큰을 Supabase로 검증, `req.user`/`req.supabase` 주입
  - `server/routes/ingredients.js` — 재료 목록/추가/삭제
  - `server/utils/response.js` — `sendSuccess`/`sendError` 공통 응답 헬퍼
  - `server/db/schema.sql` — `ingredients`, `favorites` 테이블 + RLS 정책 (**작성만 됨, 실행 여부는 확인 필요**)
- **커밋·푸시 절차 스킬** — `.claude/skills/commit-and-push/SKILL.md`
- **동작 확인된 응답(2026-09-21 로컬 실행)** — health 200, 토큰 없음/잘못된 토큰 401, 없는 경로 404, 깨진 JSON 400

## 진행 중

- **재료 API 실동작 검증** — 인증된 상태의 조회/추가/삭제(200·201·404·409)는 아직 실행해 보지 못함. 실제 사용자 토큰과 Supabase 테이블이 필요
- **Supabase 프로젝트 설정** — `server/.env`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT` 항목이 채워져 있고 `.gitignore`로 제외됨. 스키마 적용 여부는 확인 필요

## 미착수

- 즐겨찾기 API (`GET/POST/DELETE /api/favorites`)
- 추천 API (`GET /api/recipes/recommendations`) — **레시피 데이터 출처 미정이라 CLAUDE.md에서 구현 보류 상태**
- 클라이언트 전반 — 매직링크 로그인 화면, 재료 관리 화면, 공통 API 모듈, `@supabase/supabase-js` 설치(현재 client 의존성은 react/react-dom뿐)
- 서버 CORS 설정 (`CLIENT_ORIGIN` 환경 변수는 CLAUDE.md에만 정의되어 있고 코드에 사용처 없음)
- Vercel 배포 (client/server 각각 별도 프로젝트) — 배포 설정 파일 없음
- 테스트 코드 (서버·클라이언트 모두 없음)

## git 현황

브랜치 `main`, origin/main과 동기화됨. (아래 목록은 2026-09-21 기준)

| 해시 | 제목 |
|---|---|
| 3bc2cc7 | 프로젝트 진행상황 memory.md 추가 |
| 92e2969 | 커밋·푸시 절차 스킬 추가 |
| 85005ba | 서버 PORT 환경 변수 문서화 |
| 7e0bdfd | Supabase 인증 미들웨어와 재료 CRUD API 추가 |
| 3ad1e94 | Add promptLog.md with today's agent prompts |
| 04ead12 | Add CLAUDE.md and client/server project scaffold |
| c818c04 | Initial commit |

## 파일 구조 (node_modules 제외)

```
.claude/skills/commit-and-push/SKILL.md
CLAUDE.md
memory.md
promptLog.md
docs/memory/progress.md
docs/memory/decisions.md
docs/memory/issues.md
client/
  index.html            # title: GETIT
  vite.config.js
  .oxlintrc.json        # 린터는 oxlint (ESLint 아님)
  src/App.jsx           # Hello, GETIT
  src/main.jsx
  src/index.css
server/
  index.js
  supabaseClient.js
  middleware/requireAuth.js
  routes/ingredients.js
  utils/response.js
  db/schema.sql
  lib/                  # 빈 폴더, 사용처 없음
  .env                  # gitignore 대상, 내용 미기록
  .env.example
```

의존성 — client: react, react-dom / (dev) vite, @vitejs/plugin-react, oxlint, @types/react, @types/react-dom.
server: express 5, @supabase/supabase-js 2, dotenv. 실행 스크립트는 `npm start`(= `node index.js`).

## API 라우트

| 메서드 | 경로 | 인증 | 구현 | 동작 확인 |
|---|---|---|---|---|
| GET | `/api/health` | 불필요 | O | 200 확인됨 |
| GET | `/api/ingredients` | 필요 | O | 401 경로만 확인, 인증 성공 경로 확인 필요 |
| POST | `/api/ingredients` | 필요 | O (빈 이름 400, 중복 409) | 401 경로만 확인, 나머지 확인 필요 |
| DELETE | `/api/ingredients/:id` | 필요 | O (없으면 404) | 401 경로만 확인, 나머지 확인 필요 |
| GET | `/api/favorites` | 필요 | X | — |
| POST | `/api/favorites` | 필요 | X | — |
| DELETE | `/api/favorites/:recipeId` | 필요 | X | — |
| GET | `/api/recipes/recommendations` | 필요 | X (출처 미정으로 보류) | — |

그 외: 매칭되지 않는 경로 404 핸들러, 잘못된 JSON 400 처리, 그 외 오류 500 핸들러가 `server/index.js`에 있음.

## React 컴포넌트

| 컴포넌트 | 파일 | API 연동 |
|---|---|---|
| App | `client/src/App.jsx` | 없음 (`fetch`/supabase 호출 없음) |

`client/src/main.jsx`는 Vite 템플릿 기본형(StrictMode + createRoot). 라우팅 라이브러리 없음.

최종 갱신: 2026-09-21
