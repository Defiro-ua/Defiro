#!/usr/bin/env bash
# Tests for check-security-rating.sh. Needs bash, jq and curl (all on GitHub's ubuntu runners).
# Run: bash .github/scripts/check-security-rating.test.sh
set -u

script="$(dirname "$0")/check-security-rating.sh"
failures=0

# check NAME EXPECTED_EXIT COMMAND...: runs COMMAND, compares its exit code with EXPECTED_EXIT
check() {
    local name=$1 expected=$2
    shift 2
    local actual=0
    "$@" >/dev/null 2>&1 || actual=$?
    if [ "$actual" -eq "$expected" ]; then
        echo "PASS  $name"
    else
        echo "FAIL  $name (expected exit $expected, got $actual)"
        failures=$((failures + 1))
    fi
}

# evaluate JSON: feeds a measures API response to the script's decision
evaluate() {
    printf '%s' "$1" | bash "$script" --evaluate
}

check "rating A passes" 0 \
    evaluate '{"component":{"measures":[{"metric":"security_rating","value":"1.0","bestValue":true}]}}'
check "rating B fails" 1 \
    evaluate '{"component":{"measures":[{"metric":"security_rating","value":"2.0","bestValue":false}]}}'
check "no measures fails" 1 \
    evaluate '{"component":{"measures":[]}}'
check "unknown metric fails" 1 \
    evaluate '{"errors":[{"msg":"The following metric keys are not found: security_rating"}]}'
check "unreachable host fails" 1 \
    env SONAR_HOST_URL=http://127.0.0.1:9 SONAR_PROJECT_KEY=x bash "$script"
check "missing project key fails" 1 \
    env -u SONAR_PROJECT_KEY bash "$script"

if [ "$failures" -gt 0 ]; then
    echo "$failures test(s) failed"
    exit 1
fi
echo "all tests passed"
