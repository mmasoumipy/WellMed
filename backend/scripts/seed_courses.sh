#!/bin/bash
# backend/scripts/seed_courses.sh
set -euo pipefail
echo "🌱 Starting WellMed Course Seeding..."
cd "$(dirname "$0")/.."

load_env() {
    local f="$1"
    if [ -f "$f" ]; then
        echo "🔧 Loading env: $f"
        set -a
        # shellcheck disable=SC1091
        source "$f"
        set +a
    fi
}

# Only load local env files if DATABASE_URL is not already set (from Docker)
if [ -z "${DATABASE_URL:-}" ]; then
    load_env "app/.env.local"
    load_env "app/.env"
fi

: "${DATABASE_URL:?DATABASE_URL is not set. Check Docker environment or app/.env files.}"

echo "🔧 Using DATABASE_URL: $DATABASE_URL"

# Make PYTHONPATH nounset-safe
export PYTHONPATH="$(pwd)${PYTHONPATH+:$PYTHONPATH}"

python3 scripts/seed_all_courses.py
echo "✅ Course seeding completed!"