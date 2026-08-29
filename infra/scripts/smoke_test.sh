#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"

echo "=== AEGIS Smoke Test ==="
echo "Target: ${BASE_URL}"
echo

check() {
    local name="$1"
    local url="$2"
    local expected="$3"

    response=$(curl -s -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null || echo "000")
    if [ "${response}" = "${expected}" ]; then
        echo "✅ ${name} — HTTP ${response}"
    else
        echo "❌ ${name} — HTTP ${response} (expected ${expected})"
        FAILED=1
    fi
}

FAILED=0

check "Root"         "${BASE_URL}/"              "200"
check "Health"       "${BASE_URL}/health"         "200"
check "Agents"       "${BASE_URL}/agents"         "200"
check "Conformance"  "${BASE_URL}/conformance"    "200"
check "Docs"         "${BASE_URL}/docs"           "200"
check "API Docs"     "${BASE_URL}/openapi.json"   "200"

echo
if [ "${FAILED}" -eq 0 ]; then
    echo "✅ All smoke tests passed"
else
    echo "❌ Some smoke tests failed"
    exit 1
fi
