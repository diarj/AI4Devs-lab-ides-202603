#!/usr/bin/env bash
# Apply all DDL scripts in order. Usage: ./scripts/database/apply_all.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL before running." >&2
  exit 1
fi

for f in \
  scripts/database/001_user_and_ats_intake.sql \
  scripts/database/002_education_work_experience_resume.sql \
  scripts/database/003_company_recruitment_core.sql \
  scripts/database/004_position_application_interview.sql
do
  echo "Applying $f ..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
echo "Done."
