#!/bin/bash
# 에이전트 팀(.claude/agents/*) 전용 PreToolUse(Bash) 훅.
# gstack 스킬이 커밋·push·stash·PR을 지시해도 실행되지 않게 막는다.
# 커밋은 메인 세션에서 commit-and-push 스킬로만 한다 (CLAUDE.md 에이전트 팀 규칙).

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[ -n "$cmd" ] || exit 0

# `cd x && git commit`, `git -C dir push`, `(git stash)` 같은 섞인 형태도 잡는다.
if printf '%s' "$cmd" | grep -Eq '(^|[;&|({[:space:]])(git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+(commit|push|stash)([[:space:];&|)]|$)|gh[[:space:]]+pr([[:space:];&|)]|$))'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "에이전트는 커밋·push·stash·PR을 하지 않습니다. 변경은 워킹 트리에 남기고 보고하세요. 커밋은 메인 세션에서 commit-and-push 스킬로만 합니다 (CLAUDE.md 에이전트 팀 규칙)."
    }
  }'
fi
exit 0
