# 핵심 결정사항 (번복 금지)

이미 확정된 사항이다. 다시 논의하지 말고 이대로 따른다. 바꿔야 할 이유가 생기면 임의로 바꾸지 말고 사용자에게 먼저 확인한다.
규칙의 원문은 `CLAUDE.md`, 결정된 맥락은 `promptLog.md`에 있다.

## 기술 스택 · 구조

- 스택 고정: **React(Vite) / Express.js / Supabase / Vercel**, 언어는 **JavaScript**(ES Modules). TypeScript나 다른 프레임워크·DB·호스팅을 제안하지 않는다.
- 최상위 폴더는 `client/`, `server/` 둘뿐. 메모리·작업용 문서는 `.claude/docs/` 아래에 둔다(2026-09-21 결정).
- 배포는 `client/`와 `server/`를 **각각 별도의 Vercel 프로젝트**로.

## API · 데이터 흐름

- 모든 API 응답은 `success` / `data` / `error` 세 키를 항상 포함한다. 공통 헬퍼 `server/utils/response.js`로만 만든다.
- **모든 데이터 조회·저장은 Express를 거친다.** 클라이언트에서 Supabase 테이블에 직접 접근하지 않는다.
- 사용자 식별은 `Authorization` 헤더의 Supabase 토큰 검증 결과만 신뢰한다. 요청 body/query의 `user_id`는 쓰지 않는다.
- DB 테이블은 RLS를 켜서 본인 행만 접근 가능하게 한다.

## 기능 범위

- 기능은 세 가지뿐: 보유 재료 등록/관리, 재료 기반 레시피 추천, 레시피 즐겨찾기. 결제·소셜 로그인·알림 등 명세에 없는 기능은 먼저 제안하지 않는다.
- 인증은 **Supabase Auth 이메일 매직링크만** 사용. 소셜 로그인, 이메일+비밀번호는 추가하지 않는다.
- 추천 기준은 **완전 일치** — 필요한 재료를 전부 보유한 레시피만 추천한다.
- **레시피 데이터 출처는 미정.** 확정 전까지 레시피 테이블 설계, 외부 API 연동, `recipe_id` 타입 확정, 추천 로직의 데이터 조회를 구현하지 않는다. 필요해지면 먼저 사용자에게 출처를 묻는다.
- `favorites.recipe_id`는 출처가 미정이라 `text`로 두었다. 출처가 정해지면 타입을 재검토한다.

## 저장 데이터

- `ingredients`: `id`, `user_id`, `name`, `created_at`, `(user_id, name)` 유니크
- `favorites`: `id`, `user_id`, `recipe_id`, `created_at`, `(user_id, recipe_id)` 유니크
- 그 외 컬럼·테이블이 필요하면 먼저 이유를 설명하고 확인받는다.

## 환경 변수 · 비밀

- `.env` **내용을 코드나 대화에 출력하지 않는다.** 변수 이름만 언급한다.
- server: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT`(로컬 기본 4000), `CLIENT_ORIGIN`
- client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
- 서비스 롤 키 등 비밀 키는 클라이언트에 두지 않는다. 새 변수는 `.env.example`에 이름만 추가한다.

## 패키지

- 새 npm 라이브러리는 **이유와 대안을 먼저 설명하고 승인받은 뒤** 설치한다.
- 현재 설치된 것 — server: `express`, `@supabase/supabase-js`, `dotenv`, (dev) `prettier` / client: Vite react 템플릿 기본 구성(react, react-dom, vite, @vitejs/plugin-react, oxlint, @types/*), (dev) `prettier`
- `.env` 로딩은 Node 내장 `process.loadEnvFile()` 대신 `dotenv`를 쓰기로 했다(2026-09-21 결정).

## 코드 포맷 (2026-09-22 결정)

- 포맷터는 **Prettier**. oxfmt는 oxlint와 같은 계열이지만 아직 0.x라 채택하지 않았다.
- 스타일은 **작은따옴표 + 세미콜론** (`.prettierrc.json`). server의 기존 손코딩 스타일을 기준으로 삼았다.
- 설정은 루트 `.prettierrc.json` / `.prettierignore` 하나를 client·server가 공유한다. 폴더가 아니라 파일이라 최상위 폴더 규칙에 저촉되지 않는다.
- **마크다운(`*.md`)은 포맷하지 않는다.** Prettier가 한글 표를 재정렬해 diff가 크게 흔들리기 때문.
- Claude Code 훅(`.claude/settings.json` → `.claude/hooks/format.sh`)으로 자동 포맷한다. Edit·Write 직후 해당 파일, 응답 종료(Stop) 시 git 변경 파일 전체. auto 모드에서는 에이전트가 Bash로 파일을 고치므로 Stop 훅이 필요하다.

## gstack · 에이전트 팀 (2026-09-22 결정)

- gstack은 **사용자별 전역 설치**(`~/.claude/skills/gstack`, `--prefix` → `/gstack-*`)이고 저장소에 넣지 않는다. 팀 모드(required/optional)는 쓰지 않는다.
- 웹 브라우징은 `/gstack-browse`로 한다.
- **사용 금지**: `/gstack-ship`·`/gstack-qa`(자동 커밋·PR이 커밋 규칙과 충돌), `/gstack-land-and-deploy`·`/gstack-setup-deploy`(Vercel 별도 배포), `/gstack-setup-gbrain`·`/gstack-sync-gbrain`(메모리는 `.claude/docs/`만). QA는 리포트 전용 `/gstack-qa-only`로 한다.
- 에이전트 팀은 `planner`·`backend`·`frontend`·`reviewer` 네 명이다(`.claude/agents/`). 역할과 스킬은 CLAUDE.md "에이전트 팀" 표 참고. 조율은 메인 세션이 하고, 에이전트끼리는 서로 호출하지 않는다.
- **에이전트는 커밋하지 않는다.** 문서 규칙만으로는 gstack 스킬의 커밋 지시를 확실히 막을 수 없어서, 에이전트 전용 PreToolUse 훅(`.claude/hooks/block-agent-git.sh`)으로 `git commit/push/stash`와 `gh pr`을 차단한다.
- 서브에이전트는 질문할 수 없으니 선택지는 스스로 고르되 **"사용자 확인 필요"로 보고**한다. 메인 세션은 사용자 확인을 받은 뒤 다음 단계로 간다.
- gstack 스킬은 크기가 커서(60~130KB) 에이전트 `skills:`로 미리 주입하지 않는다. 필요할 때 Skill 도구로 호출한다.

## 작업 방식

- 커밋 메시지는 **한글**, `Co-Authored-By` 줄은 넣지 않는다. 커밋 전에 메시지를 제안해 승인받는다. 절차는 `.claude/skills/commit-and-push/SKILL.md`.
- `main`에 직접 커밋하고 push한다.
- 요구사항이 모호하거나 이 문서·CLAUDE.md와 충돌하면 넘겨짚지 말고 먼저 질문한다.

최종 갱신: 2026-09-22
