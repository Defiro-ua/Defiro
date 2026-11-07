#!/usr/bin/env bash
# Tests for check-security-rating.sh. Run: bash .github/scripts/check-security-rating.test.sh
# shellcheck source-path=SCRIPTDIR
set -u

here="$(dirname "$0")"
script="$here/check-security-rating.sh"
# shellcheck source=test-helpers.sh
source "$here/test-helpers.sh"

# evaluate JSON: feeds a measures API response to the script's decision
evaluate() {
    printf '%s' "$1" | bash "$script" --evaluate
}

rating() {
    printf '{"component":{"measures":[{"metric":"security_rating","value":"%s"}]}}' "$1"
}

check "rating A passes" 0 evaluate "$(rating 1.0)"
check "rating B fails" 1 evaluate "$(rating 2.0)"
check "no measures fails" 1 evaluate '{"component":{"measures":[]}}'
check "unknown metric fails" 1 \
    evaluate '{"errors":[{"msg":"The following metric keys are not found: security_rating"}]}'
check "unreachable host fails" 1 \
    env SONAR_HOST_URL=http://127.0.0.1:9 SONAR_PROJECT_KEY=x bash "$script"
check "missing project key fails" 1 \
    env -u SONAR_PROJECT_KEY bash "$script"

start_sonar_stub
live() {
    env SONAR_HOST_URL="$stub_url" SONAR_PROJECT_KEY=Defiro-ua_Defiro "$@" bash "$script"
}

sonar_responds measures/component "$(rating 1.0)"
sonar_responds issues/search '{"issues":[]}'
check "live: rating A passes" 0 live

sonar_responds measures/component "$(rating 2.0)"
sonar_responds issues/search '{"issues":[{"rule":"java:S2245","message":"Make sure this is safe.","component":"Defiro-ua_Defiro:apps/server/src/main/java/X.java","line":12}]}'
check "live: rating B fails" 1 live
check_output "live: names each open issue at its file and line" \
    "::error file=apps/server/src/main/java/X.java,line=12::java:S2245: Make sure this is safe." live
check_output "pull request: explains how a fix can still be merged" \
    "mark each issue as Accepted in SonarQube Cloud" live GITHUB_EVENT_NAME=pull_request

finish
