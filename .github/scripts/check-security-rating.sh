#!/usr/bin/env bash
# Fails unless the overall code has security rating A in SonarQube.
#
# The quality gate on SonarQube Cloud's free plan is the built-in "Sonar way", which only has
# conditions on new code. This script adds the one condition on overall code: no open security
# issue anywhere. On a pull request it reads the target branch, because SonarQube Cloud only
# analyses the changed code of a pull request; "Sonar way" already rejects new security issues
# in the pull request itself.
#
# Usage:
#   check-security-rating.sh              reads the rating from SonarQube
#   check-security-rating.sh --evaluate   reads an api/measures/component response on stdin
#
# Environment (live mode):
#   SONAR_PROJECT_KEY  required, for example Defiro-ua_Defiro
#   SONAR_BRANCH       branch to read, default main
#   SONAR_HOST_URL     default https://sonarcloud.io
#   SONAR_TOKEN        optional; public projects can be read without one
#
# Exit status: 0 when the rating is A, 1 otherwise (including when SonarQube cannot be reached).
set -euo pipefail

# Reads a measures response on stdin; succeeds only if security_rating is exactly "1.0" (A).
is_rating_a() {
    jq -e '[.component.measures[]? | select(.metric == "security_rating") | .value] == ["1.0"]' >/dev/null
}

if [ "${1:-}" = "--evaluate" ]; then
    is_rating_a
    exit
fi

project=${SONAR_PROJECT_KEY:?SONAR_PROJECT_KEY is required}
branch=${SONAR_BRANCH:-main}
host=${SONAR_HOST_URL:-https://sonarcloud.io}
auth=()
if [ -n "${SONAR_TOKEN:-}" ]; then
    auth=(-u "$SONAR_TOKEN:")
fi

api() {
    curl -fsS --max-time 30 "${auth[@]}" --get "$host/api/$1" "${@:2}"
}

if ! measures=$(api measures/component --data-urlencode "component=$project" \
    --data-urlencode "branch=$branch" --data-urlencode "metricKeys=security_rating"); then
    echo "::error::Could not read the security rating of $project ($branch) from $host."
    exit 1
fi

if printf '%s' "$measures" | is_rating_a; then
    echo "Overall code of $project ($branch) has security rating A."
    exit 0
fi

rating=$(printf '%s' "$measures" | jq -r '[.component.measures[]? | select(.metric == "security_rating") | .value][0] // "none"')
echo "::error::Overall code of $project ($branch) must have security rating A (1.0); SonarQube reports $rating. Fix the open security issues first."

# List the open security issues, so the failure says what to fix.
if issues=$(api issues/search --data-urlencode "componentKeys=$project" --data-urlencode "branch=$branch" \
    --data-urlencode "impactSoftwareQualities=SECURITY" --data-urlencode "issueStatuses=OPEN,CONFIRMED" \
    --data-urlencode "ps=20"); then
    printf '%s' "$issues" | jq -r --arg prefix "$project:" \
        '.issues[] | "::error file=\(.component | ltrimstr($prefix)),line=\(.line // 1)::\(.rule): \(.message)"'
fi
exit 1
