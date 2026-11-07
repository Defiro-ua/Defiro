#!/usr/bin/env bash
# Tests for check-security-rating.sh. Needs bash, jq, curl and python3 (all on GitHub's ubuntu
# runners); python3 serves canned SonarQube API responses.
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

# A local stand-in for SonarQube's API: the files under $stub are served as its responses.
stub=$(mktemp -d)
mkdir -p "$stub/api/measures" "$stub/api/issues"
port=8765
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$stub" >/dev/null 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null; rm -rf "$stub"' EXIT
for _ in $(seq 50); do
    curl -s "http://127.0.0.1:$port/" >/dev/null && break
    sleep 0.1
done

sonar_responds() {
    printf '%s' "$1" >"$stub/api/measures/component"
    printf '%s' "$2" >"$stub/api/issues/search"
}

# check_output NAME TEXT COMMAND...: runs COMMAND, passes if its output contains TEXT
check_output() {
    local name=$1 text=$2
    shift 2
    if "$@" 2>&1 | grep -qF -- "$text"; then
        echo "PASS  $name"
    else
        echo "FAIL  $name (output lacks: $text)"
        failures=$((failures + 1))
    fi
}

live() {
    env SONAR_HOST_URL="http://127.0.0.1:$port" SONAR_PROJECT_KEY=Defiro-ua_Defiro "$@" bash "$script"
}

rating_b='{"component":{"measures":[{"metric":"security_rating","value":"2.0","bestValue":false}]}}'
one_issue='{"issues":[{"rule":"java:S2245","message":"Make sure this is safe.","component":"Defiro-ua_Defiro:apps/server/src/main/java/X.java","line":12}]}'

sonar_responds '{"component":{"measures":[{"metric":"security_rating","value":"1.0","bestValue":true}]}}' '{"issues":[]}'
check "live: rating A passes" 0 live

sonar_responds "$rating_b" "$one_issue"
check "live: rating B fails" 1 live
check_output "live: names each open issue at its file and line" \
    "::error file=apps/server/src/main/java/X.java,line=12::java:S2245: Make sure this is safe." live
check_output "pull request: explains how a fix can still be merged" \
    "mark each issue as Accepted in SonarQube Cloud" live GITHUB_EVENT_NAME=pull_request

if [ "$failures" -gt 0 ]; then
    echo "$failures test(s) failed"
    exit 1
fi
echo "all tests passed"
