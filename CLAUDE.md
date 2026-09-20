# CLAUDE.md

## 프로젝트 개요
자취생이 냉장고에 있는 재료를 등록하면, 그 재료로 만들 수 있는 레시피를 추천해 주는 웹 서비스.

- 문제: 냉장고 재료로 뭘 해먹을지 고민하다 결국 배달을 시킨다.
- 해결: 보유 재료를 입력하면 만들 수 있는 레시피를 추천한다.

## 핵심 기능 (범위는 이 3가지로 한정)
1. **보유 재료 등록/관리** — 로그인한 사용자가 자기 재료를 추가·조회·삭제
2. **재료 기반 레시피 추천 목록** — 필요한 재료를 *전부* 보유한 레시피만 추천 (완전 일치)
3. **레시피 즐겨찾기** — 마음에 든 레시피를 즐겨찾기 추가·조회·해제

로그인 필수. 모든 기능은 로그인한 사용자 본인의 데이터만 다룬다.

## 기술 스택 (고정 — 다른 스택 제안 금지)
| 영역 | 기술 |
|---|---|
| Frontend | React (Vite), JavaScript |
| Backend | Express.js, JavaScript |
| DB / Auth | Supabase (Postgres + Supabase Auth) |
| 배포 | Vercel |

TypeScript, 다른 프레임워크, 다른 DB/인증/호스팅 서비스로 바꾸자고 제안하지 않는다.

## 폴더 구조 (고정)
```
/
├── client/   # React(Vite) 프론트엔드 — 별도 Vercel 프로젝트
├── server/   # Express.js 백엔드 — 별도 Vercel 프로젝트(서버리스 함수)
└── CLAUDE.md
```
- 최상위에는 `client/`, `server/` 두 폴더만 둔다. 새로운 최상위 폴더를 만들지 않는다.
- 메모리·작업용 문서는 `.claude/docs/` 아래에 둔다 (진입점: `.claude/docs/memory.md`).
- 각 폴더는 자체 `package.json`을 가진다.

## 아키텍처
```
[React 클라이언트] --(매직링크 로그인)--> [Supabase Auth]
        |
        | Authorization: Bearer <Supabase access token>
        v
[Express 서버] --(사용자 토큰으로 조회/저장)--> [Supabase DB]
```
- **클라이언트는 Supabase를 로그인/세션 관리에만 사용**한다 (`signInWithOtp` 매직링크).
- **재료·즐겨찾기·추천 등 모든 데이터 조회/저장은 Express API를 거친다.** 클라이언트에서 Supabase 테이블을 직접 읽거나 쓰지 않는다.
- Express는 모든 보호된 요청에서 `Authorization` 헤더의 토큰을 Supabase로 검증하고, 검증된 사용자 ID로만 데이터를 다룬다. 요청 body/query로 받은 user_id는 신뢰하지 않는다.
- DB 테이블에는 RLS를 켜서 본인 행만 접근 가능하게 한다.

## 인증
- 방식: Supabase Auth **이메일 매직링크**만 사용.
- 소셜 로그인, 이메일+비밀번호 등 다른 방식은 추가하지 않는다.

## 저장 데이터
명세서상 저장 데이터는 아래 두 가지뿐이다. 그 외 컬럼/테이블은 필요 시 먼저 이유를 설명하고 확인받는다.

- **ingredients** — 사용자별 보유 재료 목록
  - `id`, `user_id`(auth.users 참조), `name`, `created_at`
- **favorites** — 사용자별 즐겨찾기한 레시피 ID
  - `id`, `user_id`(auth.users 참조), `recipe_id`, `created_at`
  - `(user_id, recipe_id)` 유니크

## ⚠️ 미정 사항 (임의로 결정·구현하지 말 것)
- **레시피 데이터 출처가 정해지지 않았다.** (Supabase 테이블 / 외부 API 등)
  - 레시피 테이블 설계, 외부 API 연동, `recipe_id`의 타입·형식, 추천 로직의 데이터 조회 부분은 **출처가 확정되기 전까지 구현하지 않는다.**
  - 이 부분이 필요한 작업을 요청받으면 먼저 사용자에게 출처를 질문한다.

## API 규칙
### 응답 형식 (모든 엔드포인트 통일)
성공:
```json
{ "success": true, "data": { ... }, "error": null }
```
실패:
```json
{ "success": false, "data": null, "error": { "message": "에러 설명" } }
```
- 성공/실패 모두 `success`, `data`, `error` 세 키를 항상 포함한다.
- HTTP 상태 코드도 상황에 맞게 설정한다 (400, 401, 404, 500 등).
- 응답은 공통 헬퍼로 만들어 형식이 어긋나지 않게 한다.
- 에러 메시지에 스택 트레이스, 키, 내부 쿼리 등 민감 정보를 담지 않는다.

### 엔드포인트 (모두 `/api` 하위, `/api/health`를 제외하고 로그인 필요)
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/health` | 서버 상태 확인 (로그인 불필요) |
| GET | `/api/ingredients` | 내 보유 재료 목록 |
| POST | `/api/ingredients` | 재료 추가 |
| DELETE | `/api/ingredients/:id` | 재료 삭제 |
| GET | `/api/recipes/recommendations` | 보유 재료를 전부 충족하는 레시피 목록 (**레시피 출처 확정 후 구현**) |
| GET | `/api/favorites` | 내 즐겨찾기 목록 |
| POST | `/api/favorites` | 즐겨찾기 추가 (`recipe_id`) |
| DELETE | `/api/favorites/:recipeId` | 즐겨찾기 해제 |

## 환경 변수
변수 **이름**만 기록한다. 실제 값은 `.env`에만 두고 커밋하지 않는다.
- client (`client/.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
- server (`server/.env`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT`(로컬 기본 4000), `CLIENT_ORIGIN`(CORS 허용 도메인)
- 클라이언트 코드에는 `VITE_` 접두사 변수만 사용한다. 서비스 롤 키 등 비밀 키는 클라이언트에 절대 두지 않는다.
- 새 환경 변수가 필요하면 이름과 용도를 설명하고 `.env.example`에 이름만 추가한다.

## 배포
- `client/`와 `server/`를 **각각 별도의 Vercel 프로젝트**로 배포한다.
- 클라이언트는 `VITE_API_BASE_URL`로 서버 주소를 받는다.
- 서버는 `CLIENT_ORIGIN`에 지정된 도메인만 CORS 허용한다.
- 환경 변수 값은 Vercel 대시보드에서 설정한다.

## 코딩 컨벤션
- JavaScript (ES Modules) 사용.
- React: 함수형 컴포넌트 + Hooks.
- Express: 라우트(`routes/`) → 비즈니스 로직 분리, 인증은 미들웨어로 처리.
- API 호출은 클라이언트의 공통 API 모듈 한 곳에서 처리하고, 토큰 첨부도 거기서 한다.

## 하지 말아야 할 것
1. **임의로 새 npm 라이브러리를 설치하지 않는다.** 설치가 필요하면 먼저 *왜 필요한지, 대안(직접 구현 등)은 무엇인지*를 설명하고 확인받은 뒤 설치한다.
2. **`.env` 파일의 내용을 코드나 대화에 출력하지 않는다.** 값을 읽어 보여주거나, 코드에 하드코딩하거나, 로그로 찍지 않는다. 변수 이름만 언급한다.
3. 명세서에 없는 기능(결제, 소셜 로그인, 알림 등)을 먼저 제안하거나 구현하지 않는다.
4. 지정된 기술 스택(React+Vite / Express / Supabase / Vercel) 외의 스택을 제안하지 않는다.
5. `client/`, `server/` 외의 최상위 폴더 구조를 만들지 않는다.
6. 클라이언트에서 Supabase DB에 직접 데이터 조회/저장을 하지 않는다 (모든 데이터는 Express 경유).
7. `success / data / error` 형식을 벗어난 API 응답을 만들지 않는다.
8. 레시피 데이터 출처가 확정되기 전에 레시피 저장소·외부 API 연동을 임의로 구현하지 않는다.

## 작업 방식
- 요구사항이 모호하거나 이 문서와 충돌하는 요청이 오면, **넘겨짚지 말고 먼저 질문해서 확인**한다.
- 스키마 변경, 새 엔드포인트 추가, 새 환경 변수 추가는 먼저 내용을 설명한 뒤 진행한다.
- **작업을 마칠 때 메모리를 갱신한다.** `.claude/docs/memory.md`는 **50줄 이하**로 유지한다(현재 상태 요약, 다음 할 일, 라우팅 표만). 상세 내용은 `.claude/docs/memory/` 아래 파일에 기록한 뒤 라우팅 표만 갱신한다.
  - 완료된 작업·파일 구조·API 현황 → `.claude/docs/memory/progress.md`
  - 번복하면 안 되는 결정 → `.claude/docs/memory/decisions.md`
  - 이슈·미검증 항목·트러블슈팅 → `.claude/docs/memory/issues.md`
