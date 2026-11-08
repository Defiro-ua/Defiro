# shellcheck shell=bash
# Helpers for the CI scripts' tests. Source this file from a *.test.sh script.
# Needs bash, curl and python3 (all on GitHub's ubuntu runners).

failures=0

# check NAME EXPECTED_EXIT COMMAND...: runs COMMAND and compares its exit code with EXPECTED_EXIT
check() {
    local name=$1 expected=$2
    shift 2
    local actual=0
    "$@" >/dev/null 2>&1 || actual=$?
    if [[ "$actual" -eq "$expected" ]]; then
        echo "PASS  $name"
    else
        echo "FAIL  $name (expected exit $expected, got $actual)"
        failures=$((failures + 1))
    fi
}

# check_output NAME TEXT COMMAND...: runs COMMAND and passes if its output contains TEXT
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

# start_sonar_stub: serves the files under $stub as SonarQube's API at $stub_url
start_sonar_stub() {
    stub=$(mktemp -d)
    local port=8765
    stub_url="http://127.0.0.1:$port"
    python3 -m http.server "$port" --bind 127.0.0.1 --directory "$stub" >/dev/null 2>&1 &
    stub_pid=$!
    trap 'kill "$stub_pid" 2>/dev/null; rm -rf "$stub"' EXIT
    for _ in $(seq 50); do
        curl -s "$stub_url/" >/dev/null && return
        sleep 0.1
    done
    echo "FAIL  the SonarQube stub did not start"
    exit 1
}

# sonar_responds PATH BODY: the stub answers requests to /api/PATH with BODY
sonar_responds() {
    mkdir -p "$(dirname "$stub/api/$1")"
    printf '%s' "$2" >"$stub/api/$1"
}

# finish: reports the result and exits non-zero if any check failed
finish() {
    if [[ "$failures" -gt 0 ]]; then
        echo "$failures test(s) failed"
        exit 1
    fi
    echo "all tests passed"
}
