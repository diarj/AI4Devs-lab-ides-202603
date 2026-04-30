# Apply all DDL scripts in order (PostgreSQL / psql).
# Usage: .\scripts\database\apply_all.ps1
# Requires: psql on PATH, and $env:DATABASE_URL or PG* variables.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$scripts = @(
  "scripts/database/001_user_and_ats_intake.sql",
  "scripts/database/002_education_work_experience_resume.sql",
  "scripts/database/003_company_recruitment_core.sql",
  "scripts/database/004_position_application_interview.sql"
)

if ($env:DATABASE_URL) {
  foreach ($f in $scripts) {
    Write-Host "Applying $f ..."
    psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f $f
  }
  Write-Host "Done."
  exit 0
}

Write-Host "Set DATABASE_URL (recommended) or use psql with -h -U -d and run each file from README.md."
exit 1
