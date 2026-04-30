-- 002_education_work_experience_resume.sql
-- Source: docs/data-model.md sections 2–4 (Education, WorkExperience, Resume)
-- FK candidateId references ATS Candidate.id (TEXT / UUID)

CREATE TABLE IF NOT EXISTS "Education" (
  "id" SERIAL NOT NULL,
  "institution" VARCHAR(100) NOT NULL,
  "title" VARCHAR(250) NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "candidateId" TEXT NOT NULL,
  CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "Education"
    ADD CONSTRAINT "Education_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Education_candidateId_idx" ON "Education" ("candidateId");

CREATE TABLE IF NOT EXISTS "WorkExperience" (
  "id" SERIAL NOT NULL,
  "company" VARCHAR(100) NOT NULL,
  "position" VARCHAR(100) NOT NULL,
  "description" VARCHAR(200),
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "candidateId" TEXT NOT NULL,
  CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "WorkExperience"
    ADD CONSTRAINT "WorkExperience_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "WorkExperience_candidateId_idx" ON "WorkExperience" ("candidateId");

-- Classic resume file row (section 4); distinct from ATS CandidateDocument
CREATE TABLE IF NOT EXISTS "Resume" (
  "id" SERIAL NOT NULL,
  "filePath" VARCHAR(500) NOT NULL,
  "fileType" VARCHAR(50) NOT NULL,
  "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "candidateId" TEXT NOT NULL,
  CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "Resume"
    ADD CONSTRAINT "Resume_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Resume_candidateId_idx" ON "Resume" ("candidateId");
