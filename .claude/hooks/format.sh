#!/bin/bash
# client/·server/ 코드 파일을 Prettier로 포맷하는 Claude Code 훅.
# - PostToolUse(Edit|Write|MultiEdit): stdin JSON의 tool_input.file_path 한 개만 포맷
# - Stop: file_path가 없으므로 git 기준 변경·신규 파일 전체를 포맷 (Bash로 고친 파일까지 잡기 위함)
# 포맷 실패가 작업을 막으면 안 되므로 항상 0으로 끝낸다. macOS 기본 bash 3.2 호환.

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$root" ] && cd "$root" || exit 0

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -n "$file" ]; then
  candidates="${file#"$root"/}"
else
  candidates=$({ git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u)
fi

client_files=()
server_files=()
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    *.js | *.jsx | *.mjs | *.cjs | *.css | *.html | *.json) ;;
    *) continue ;;
  esac
  case "$f" in
    client/*) client_files+=("${f#client/}") ;;
    server/*) server_files+=("${f#server/}") ;;
  esac
done <<<"$candidates"

# 각 패키지 안에서 실행하되, npm run format과 같은 ignore 규칙을 쓴다.
run_prettier() {
  pkg=$1
  shift
  [ $# -gt 0 ] || return 0
  [ -x "$pkg/node_modules/.bin/prettier" ] || return 0
  (cd "$pkg" && node_modules/.bin/prettier --write --ignore-unknown --log-level warn \
    --ignore-path ../.gitignore --ignore-path ../.prettierignore --ignore-path .gitignore "$@")
}

run_prettier client "${client_files[@]}"
run_prettier server "${server_files[@]}"
exit 0
