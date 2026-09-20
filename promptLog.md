# Prompt Log

AI 에이전트(Claude Code)에게 지시한 프롬프트 원문과, 진행 중 확인·결정된 사항을 기록한다.

---

## 2026-09-17

### 1. CLAUDE.md 작성

**프롬프트 원문**
```
위는 내가 만들고 싶은 서비스의 아이디어 명세서야.

1. 문제: 자취생은 냉장고에 있는 재료로 뭘 해먹을지 매번 고민하다 배달을 시킨다.
2. 해결: 냉장고 속 재료를 입력하면 만들 수 있는 레시피를 추천해준다.
3. 핵심 기능:
   - 기능 1: 보유 재료 등록/관리
   - 기능 2: 재료 기반 레시피 추천 목록
   - 기능 3: 마음에 든 레시피 즐겨찾기
4. 로그인 필요: Y
5. 저장 데이터: 사용자별 보유 재료 목록, 즐겨찾기한 레시피 ID

이 내용을 기반으로 이 프로젝트의 CLAUDE.md 파일을 작성해줘.

조건:
- 기술 스택은 반드시 Frontend: React(Vite), Backend: Express.js,
  DB/Auth: Supabase, 배포: Vercel 로 고정하고 다른 스택은 제안하지 마.
- 폴더 구조는 /client(프론트), /server(백엔드) 두 개로 고정해줘.
- API 응답 형식은 success, data, error 로 통일해줘.
- 위 명세서에 없는 기능(결제, 소셜 로그인, 알림 등)은 먼저 제안하지 마.
- "하지 말아야 할 것" 섹션을 반드시 포함하고, 아래 두 가지를 넣어줘.
  1) 임의로 새 npm 라이브러리를 설치하기 전에 이유를 먼저 설명할 것
  2) .env 파일의 내용을 코드나 대화에 출력하지 말 것
- 조건 중 판단이 서지 않거나 모호한 부분이 있으면, 임의로 넘겨짚지 말고 먼저 나에게 질문해서 확인할 것
```

**결정사항**
- 레시피 데이터 출처: 미정 (확정 전까지 레시피 저장소·외부 API 연동 구현 금지)
- 로그인 방식: Supabase Auth 이메일 매직링크
- 추천 기준: 필요한 재료를 전부 보유한 레시피만 (완전 일치)
- 언어: JavaScript / 문서는 한국어
- 데이터 경로: 모든 데이터 조회·저장은 Express 경유 (클라이언트는 Supabase를 로그인에만 사용)
- 배포 구조: /client, /server 각각 별도 Vercel 프로젝트

---

### 2. 프로젝트 뼈대 생성

**프롬프트 원문**
```
방금 작성한 CLAUDE.md를 읽고, 그 내용을 기준으로 프로젝트 뼈대를 만들어줘.

요구사항:
- /client 폴더에 Vite + React 프로젝트를 생성해줘
- /server 폴더에 Express 프로젝트를 생성해줘 (진입점: server/index.js, 포트는 4000)
- /client는 npm run dev로, /server는 node index.js로 각각 바로 실행 가능해야 해
- 화면에는 "Hello, (프로젝트 이름)"이 보이는 정도의 최소한의 코드만 작성해줘
- 아직 로그인, DB 연동 등 실제 기능은 구현하지 말고 뼈대만 만들어줘
```

**결정사항**
- 프로젝트 이름: GETIT (화면 "Hello, GETIT", 패키지명 `getit-client` / `getit-server`)
- client 생성 방식: create-vite React 템플릿 그대로 사용 (샘플 코드만 정리)
- 서버 확인용 엔드포인트: `GET /api/health` 추가 (로그인 불필요, CLAUDE.md 엔드포인트 표에 반영)

---

### 3. .gitignore 수정 및 커밋

**프롬프트 원문**
```
.gitignore에서 lib/ 규칙 지우고 커밋해줘
```

**결정사항**
- `lib/` 규칙만 삭제 (`lib64/`는 유지)
- `main`이 아닌 `chore/project-scaffold` 브랜치를 만들어 커밋

---

### 4. 프롬프트 로그 작성

**프롬프트 원문**
```
오늘 작성한 프롬프트를 바탕으로 AI에이전트에게 지시했던 명령문들을 정리해서 적어두는 'prompthLog.md' 파일을 생성해줘.
```

**결정사항**
- 파일명: `promptLog.md` (원문의 'prompthLog'는 오타로 확인)
- 기록 범위: 프롬프트 원문 + 결정사항
- 생성 후 커밋, 커밋 메시지에 `Co-Authored-By` 줄은 넣지 않음

---

## 2026-09-20

### 5. Supabase 패키지 추가 후 다음 단계

**프롬프트 원문**
```
supabase 패키지를 추가를 했는데 여기서 어떻게 하면 좋을까?
```

**결정사항**
- 진행 범위: 재료(ingredients) CRUD API까지 (연결 확인 + 인증 미들웨어 포함)
- Supabase 테이블은 아직 없음 → 실행할 SQL을 파일로 제공하고 실행은 사용자가 대시보드에서
- 즐겨찾기·추천 API, 클라이언트 로그인 화면은 이번 범위에서 제외

---

## 2026-09-21

### 6. dotenv 설치

**프롬프트 원문**
```
dotenv 라이브러리를 설치까지 진행을 해줘
```

**결정사항**
- `.env` 로딩은 Node 내장 `process.loadEnvFile()` 대신 `dotenv` 패키지 사용
- `server/index.js`의 첫 import를 `dotenv/config`로 두어 supabaseClient보다 먼저 평가되게 함
- 이번에 설치하는 패키지는 `dotenv` 하나뿐

---

### 7. 매직링크 access token 획득 방법

**프롬프트 원문**
```
매직링크로 로그인해서 access token을 어떻게 얻어오는지 알려줘
```

**결정사항**
- 방법 A(메일 링크 클릭 후 주소창 `#access_token` 복사)와 방법 B(`{{ .Token }}` 6자리 코드를 `/auth/v1/verify`로 교환) 두 가지를 안내
- 메일 발송은 실제 발송이므로 에이전트가 임의로 실행하지 않음
- Site URL을 `http://localhost:5173`으로 변경 권장

---

### 8. otp 요청 실패 (PGRST125)

**프롬프트 원문**
```
set -a && . ./.env && set +a && curl -s -X POST "$SUPABASE_URL/auth/v1/otp" -H "apikey: $SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"email":" 본인이메일@example.com","create_user":true}'
{"code":"PGRST125","details":null,"hint":null,"message":"Invalid path specified in request URL"}
```

**결정사항**
- 원인: `.env`의 `SUPABASE_URL`에 `/rest/v1/` 경로가 붙어 있어 인증 엔드포인트 대신 REST API로 요청됨
- `SUPABASE_URL`을 프로젝트 기본 주소(origin)만 남기도록 수정 (값은 출력하지 않음)
- 이후 `.env.example`에도 같은 실수를 막는 주석을 추가하기로 함

---

### 9. 깃허브 업로드 (커밋 메시지 사전 제안)

**프롬프트 원문**
```
깃허브에 올릴건데 커밋메세지를 먼저 제안을 해주고 진행하자
```
```
커밋메세지를 한글로 진행해줘
```

**결정사항**
- 커밋은 두 개로 분리 (서버 기능 / CLAUDE.md 문서 수정)
- 커밋 메시지는 한글, `Co-Authored-By` 줄 없음
- `.env.example`에 `SUPABASE_URL` 형식 주석 추가 후 커밋
- `main`에 바로 커밋하고 push

---

### 10. 커밋·푸시 절차 스킬화

**프롬프트 원문**
```
방금 깃허브에 올리는 진행방식을 스킬로 만들어줘
```

**결정사항**
- 저장 위치: 프로젝트 안 `.claude/skills/commit-and-push/SKILL.md`
- 고정할 규칙 4가지 모두 적용 — 한글 커밋 메시지, `Co-Authored-By` 제외, 메시지 사전 제안·승인, 비밀 파일 점검

---

### 11. 스킬 파일 커밋·푸시

**프롬프트 원문**
```
응, 이 스킬 파일도 커밋하고 푸시해줘
```

**결정사항**
- 방금 만든 `commit-and-push` 스킬 절차를 그대로 적용해 진행
- 단일 커밋으로 `main`에 커밋 후 push

---

### 12. 프롬프트 로그 갱신

**프롬프트 원문**
```
promptLog.md에도 오늘 프롬프트 추가해줘
```

**결정사항**
- 기존 형식(프롬프트 원문 + 결정사항)을 유지하고 날짜 섹션을 이어서 추가
