# 알려진 이슈 & 트러블슈팅

## 확인 필요

- Supabase 대시보드 설정 — Site URL, 매직링크 템플릿의 `{{ .Token }}` 추가 여부 (토큰 발급 자체는 성공 확인됨)
- **RLS 격리** — 다른 사용자 토큰으로 남의 행이 안 보이는지는 계정이 하나뿐이라 미검증. 정책은 `auth.uid() = user_id`로 걸려 있다
- `client/.env` 존재 여부 및 `VITE_` 변수 설정 여부 (현재 클라이언트가 API를 호출하지 않아 미사용)
- Vercel 프로젝트 생성·연결 여부

## 해결된 이슈

### `DELETE /api/ingredients/:id`에 uuid가 아닌 값이 오면 500이던 문제 (2026-09-21)

- **증상** — `DELETE /api/ingredients/not-a-uuid` → 500 `'재료를 삭제하지 못했습니다.'`
- **원인** — Postgres가 `22P02 invalid input syntax for type uuid`를 던지는데 `server/routes/ingredients.js`의 에러 처리가 전부 500으로 넘겼다
- **해결** — `error.code === '22P02'`를 404 `'재료를 찾을 수 없습니다.'`로 분기. uuid 형식이 아닌 id는 어떤 행과도 매칭될 수 없어 '없는 재료'와 결과가 같고, 클라이언트 에러 처리도 한 갈래로 끝난다
- **검증** — `not-a-uuid`, `12345` 모두 404. 정상 삭제 200과 없는 uuid 404도 회귀 확인
- **참고** — 즐겨찾기는 `recipe_id`가 text라 같은 문제가 없다

### `SUPABASE_URL`에 `/rest/v1` 경로가 붙어 있던 문제 (2026-09-21)

- **증상** — `/auth/v1/otp` 호출이 `{"code":"PGRST125","message":"Invalid path specified in request URL"}`로 실패
- **원인** — `.env`의 `SUPABASE_URL`이 `https://<ref>.supabase.co/rest/v1/`였다. 인증 엔드포인트 대신 PostgREST로 요청이 갔고, `supabase-js`도 내부에서 `/rest/v1`을 덧붙이기 때문에 같이 깨진다.
- **해결** — 값을 프로젝트 기본 주소(origin)만 남기도록 수정. `/auth/v1/settings`가 200을 반환하는 것으로 확인
- **재발 방지** — `server/.env.example`에 형식 주석을 넣어 두었다.

### 깨진 JSON 요청이 500으로 나가던 문제 (2026-09-21)

- **증상** — 잘못된 JSON 본문을 보내면 서버 오류(500)로 응답
- **원인** — `express.json()`이 던지는 파싱 에러가 공통 에러 핸들러에서 전부 500으로 처리됨
- **해결** — `server/index.js` 에러 핸들러에서 `err.type === 'entity.parse.failed'`를 400으로 분기

## 참고 절차

### 매직링크로 access token 얻기

사전 준비: Supabase 대시보드에서 Email 로그인 활성화, Site URL을 `http://localhost:5173`으로 설정.

- **방법 A** — `/auth/v1/otp`로 메일 발송 → 링크 클릭 → 주소창의 `#access_token=...` 값 복사
- **방법 B** — Magic Link 이메일 템플릿에 `{{ .Token }}` 추가 → 6자리 코드를 `/auth/v1/verify`(`type: "magiclink"`, 신규 가입이면 `"email"`)로 교환하면 JSON으로 `access_token`을 받는다

토큰은 기본 **1시간 후 만료**된다. 만료되면 401이 떨어지니 다시 발급받는다. 토큰은 비밀번호와 같으므로 커밋하거나 대화에 붙여넣지 않는다.

## 사소한 정리거리

- **포트 4000에 옛날 서버가 떠 있을 수 있다** — 2026-09-21 작업 중 이전 세션에서 띄운 `node index.js`(옛 코드)가 4000을 잡고 있어, 새로 추가한 라우트가 404로 나왔다. 코드를 고쳤는데 응답이 그대로면 `lsof -nP -iTCP:4000 -sTCP:LISTEN`로 오래된 프로세스부터 확인한다.

- `server/lib/` — 빈 폴더이고 사용처가 없다. 지워도 된다(빈 폴더라 git에는 올라가지 않음).
- `CLIENT_ORIGIN` — CLAUDE.md와 `.env` 항목에는 있지만 코드에서 쓰는 곳이 없다. CORS 설정을 넣을 때 사용한다.

## TODO / FIXME 주석

코드·문서 전체 검색 결과 **없음** (js, jsx, sql, md, html 대상, 2026-09-21 기준).

최종 갱신: 2026-09-21
