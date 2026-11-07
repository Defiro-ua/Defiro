#!/usr/bin/env bash
# Tests for check-new-issues.sh. Run: bash .github/scripts/check-new-issues.test.sh
# shellcheck source-path=SCRIPTDIR
set -u

here="$(dirname "$0")"
script="$here/check-new-issues.sh"
# shellcheck source=test-helpers.sh
source "$here/test-helpers.sh"

evaluate() {
    printf '%s' "$1" | bash "$script" --evaluate
}

new_issues() {
    printf '{"component":{"measures":[{"metric":"new_violations","periods":[{"index":1,"value":"%s","bestValue":false}]}]}}' "$1"
}

check "no new issues passes" 0 evaluate "$(new_issues 0)"
check "one new issue fails" 1 evaluate "$(new_issues 1)"
check "five new issues fail" 1 evaluate "$(new_issues 5)"
check "no measures fails" 1 evaluate '{"component":{"measures":[]}}'
check "unknown metric fails" 1 \
    evaluate '{"errors":[{"msg":"The following metric keys are not found: new_violations"}]}'
check "unreachable host fails" 1 \
    env SONAR_HOST_URL=http://127.0.0.1:9 SONAR_PROJECT_KEY=x SONAR_PULL_REQUEST=1 bash "$script"
check "missing project key fails" 1 \
    env -u SONAR_PROJECT_KEY SONAR_PULL_REQUEST=1 bash "$script"
check "missing pull request number fails" 1 \
    env -u SONAR_PULL_REQUEST SONAR_PROJECT_KEY=x bash "$script"

start_sonar_stub
live() {
    env SONAR_HOST_URL="$stub_url" SONAR_PROJECT_KEY=Defiro-ua_Defiro SONAR_PULL_REQUEST=17 bash "$script"
}

sonar_responds measures/component "$(new_issues 0)"
sonar_responds issues/search '{"issues":[]}'
check "live: no new issues passes" 0 live

sonar_responds measures/component "$(new_issues 1)"
sonar_responds issues/search '{"issues":[{"rule":"shell:S7688","message":"Use [[ instead of [.","component":"Defiro-ua_Defiro:.github/scripts/x.sh","line":28}]}'
check "live: a new issue fails" 1 live
check_output "live: names each new issue at its file and line" \
    "::error file=.github/scripts/x.sh,line=28::shell:S7688: Use [[ instead of [." live

finish
