# GETIT 메모리 (라우터)

## 현재 상태

- 냉장고 재료로 레시피를 추천하는 서비스. 스택은 React(Vite) / Express / Supabase / Vercel로 고정.
- 서버는 Supabase 토큰 인증과 재료 CRUD API(`/api/ingredients`)까지 구현됐고, 인증 실패 경로만 실제로 확인됐다.
- 클라이언트는 "Hello, GETIT"만 렌더하는 스캐폴드 상태이고, API 호출은 아직 하나도 없다.

## 다음 할 일

1. `server/db/schema.sql`을 Supabase SQL Editor에서 실행해 테이블·RLS 적용
2. 매직링크로 access token을 받아 재료 CRUD 실동작 검증 (절차는 issues.md)
3. 즐겨찾기 API 3개 구현 (`GET/POST/DELETE /api/favorites`)
4. 클라이언트 매직링크 로그인 + 재료 관리 화면, 공통 API 모듈
5. 서버 CORS(`CLIENT_ORIGIN`) 설정과 Vercel 배포

추천 API는 레시피 데이터 출처가 정해지기 전까지 손대지 않는다.

## 이럴 때 → 이 파일을 읽어라

| 상황 | 파일 |
|---|---|
| 지금까지 뭐가 됐는지, 파일 구조·API 목록·의존성이 궁금할 때 | `.claude/docs/memory/progress.md` |
| 왜 이렇게 정했는지, 또는 기존 결정을 바꾸려 할 때 | `.claude/docs/memory/decisions.md` |
| 에러가 났을 때, 미검증·확인 필요 항목을 볼 때, 토큰 발급 절차가 필요할 때 | `.claude/docs/memory/issues.md` |
| 코딩 규칙·금지사항·API 응답 형식 | `CLAUDE.md` |
| 지금까지 받은 지시와 그때의 결정 이력 | `promptLog.md` |
| DB 테이블·RLS 정의 | `server/db/schema.sql` |
| 커밋·푸시 절차 | `.claude/skills/commit-and-push/SKILL.md` |

최종 갱신: 2026-09-21
