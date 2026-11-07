#!/usr/bin/env bash
# Fails if a pull request adds any new SonarQube issue.
#
# SonarQube Cloud's built-in "Sonar way" gate judges new code by ratings, so a few minor code
# smells still pass it. The team's gate allows no new issues at all; the free plan can't add
# that condition to the gate, so CI checks it here. Issues accepted in SonarQube, with their
# reason, no longer count as new.
#
# Usage:
#   check-new-issues.sh              reads the pull request's new issues from SonarQube
#   check-new-issues.sh --evaluate   reads an api/measures/component response on stdin
#
# Environment (live mode):
#   SONAR_PROJECT_KEY   required, for example Defiro-ua_Defiro
#   SONAR_PULL_REQUEST  required, the pull request number
#   SONAR_HOST_URL      default https://sonarcloud.io
#   SONAR_TOKEN         optional; public projects can be read without one
#
# Exit status: 0 when there are no new issues, 1 otherwise (including when SonarQube cannot be reached).
set -euo pipefail

# Reads a measures response on stdin; succeeds only if new_violations is exactly "0".
has_no_new_issues() {
    jq -e '[.component.measures[]? | select(.metric == "new_violations") | .periods[0].value // .value] == ["0"]' >/dev/null
}

if [[ "${1:-}" == "--evaluate" ]]; then
    has_no_new_issues
    exit
fi

project=${SONAR_PROJECT_KEY:?SONAR_PROJECT_KEY is required}
pull_request=${SONAR_PULL_REQUEST:?SONAR_PULL_REQUEST is required}
host=${SONAR_HOST_URL:-https://sonarcloud.io}
auth=()
if [[ -n "${SONAR_TOKEN:-}" ]]; then
    auth=(-u "$SONAR_TOKEN:")
fi

api() {
    curl -fsS --max-time 30 ${auth[@]+"${auth[@]}"} --get "$host/api/$1" "${@:2}"
}

if ! measures=$(api measures/component --data-urlencode "component=$project" \
    --data-urlencode "pullRequest=$pull_request" --data-urlencode "metricKeys=new_violations"); then
    echo "::error::Could not read the new issues of pull request $pull_request from $host."
    exit 1
fi

if printf '%s' "$measures" | has_no_new_issues; then
    echo "Pull request $pull_request adds no new SonarQube issues."
    exit 0
fi

count=$(printf '%s' "$measures" | jq -r '[.component.measures[]? | select(.metric == "new_violations") | .periods[0].value // .value][0] // "an unknown number of"')
echo "::error::Pull request $pull_request adds $count new SonarQube issue(s). Fix them, or accept each one in SonarQube Cloud with the reason."

# List the new issues, so the failure says what to fix.
if issues=$(api issues/search --data-urlencode "componentKeys=$project" --data-urlencode "pullRequest=$pull_request" \
    --data-urlencode "resolved=false" --data-urlencode "ps=20"); then
    printf '%s' "$issues" | jq -r --arg prefix "$project:" \
        '.issues[] | "::error file=\(.component | ltrimstr($prefix)),line=\(.line // 1)::\(.rule): \(.message)"'
fi
exit 1
