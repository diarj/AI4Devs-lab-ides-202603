# Database DDL scripts (from `docs/data-model.md`)

These scripts create PostgreSQL tables that match the data model documentation. The **ATS intake** section (`User`, `Candidate`, `CandidateDocument`) aligns with `backend/prisma/schema.prisma` and the Prisma migration under `backend/prisma/migrations/`.

**Recommended:** for day-to-day development, use Prisma instead:

```bash
cd backend
npx prisma migrate deploy
```

Use the SQL files when you need raw DDL (DBA review, non-Prisma environments, or documentation-driven provisioning).

## Execution order

| Order | File | Contents |
| --- | --- | --- |
| 1 | `001_user_and_ats_intake.sql` | `User`, enum `CandidateDocumentType`, `Candidate`, `CandidateDocument` |
| 2 | `002_education_work_experience_resume.sql` | `Education`, `WorkExperience`, `Resume` (FK → `Candidate.id` as `TEXT`) |
| 3 | `003_company_recruitment_core.sql` | `Company`, `Employee`, `InterviewType`, `InterviewFlow`, `InterviewStep` |
| 4 | `004_position_application_interview.sql` | `Position`, `Application`, `Interview` |

## Notes

- `Candidate.id` is `TEXT` (UUID string) to match the current backend implementation, not `INTEGER` as in the mermaid sketch in the doc. Child tables in script `002` use `TEXT` foreign keys accordingly.
- `CandidateDocument` covers ATS CV uploads (`storageKey`, MIME, size). The `Resume` table in script `002` follows section 4 of the doc (`filePath`, `fileType`, `uploadDate`) for the classic resume model; you can use one or both depending on product rules.
- Uniqueness of `Candidate.email` is described in the documentation; the Prisma schema currently exposes a non-unique index. Enforce uniqueness in SQL only if product rules require it.

## Apply (psql example)

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/database/001_user_and_ats_intake.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/database/002_education_work_experience_resume.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/database/003_company_recruitment_core.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/database/004_position_application_interview.sql
```

PowerShell:

```powershell
$env:PGPASSWORD = "..."
psql -h localhost -p 5432 -U LTIdbUser -d LTIdb -v ON_ERROR_STOP=1 -f scripts/database/001_user_and_ats_intake.sql
```
