-- 001_user_and_ats_intake.sql
-- Source: docs/data-model.md (ATS recruiter intake + User)
-- PostgreSQL. Idempotent where possible.

-- Enum for CV documents (matches Prisma CandidateDocumentType)
DO $$
BEGIN
  CREATE TYPE "CandidateDocumentType" AS ENUM ('CV');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- User (recruiter / system users creating candidates)
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");

-- Candidate (UUID string id — matches backend Prisma)
CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "education" TEXT,
  "workExperience" TEXT,
  "createdByUserId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Candidate_email_idx" ON "Candidate" ("email");

-- Note: docs/data-model.md recommends unique email; Prisma schema currently uses a non-unique index only.

-- FK User → Candidate (skip if already present)
DO $$
BEGIN
  ALTER TABLE "Candidate"
    ADD CONSTRAINT "Candidate_createdByUserId_fkey"
    FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "CandidateDocument" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "documentType" "CandidateDocumentType" NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "CandidateDocument"
    ADD CONSTRAINT "CandidateDocument_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
