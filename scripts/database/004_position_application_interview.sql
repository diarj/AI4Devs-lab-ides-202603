-- 004_position_application_interview.sql
-- Source: docs/data-model.md sections 10–12 (Position, Application, Interview)

CREATE TABLE IF NOT EXISTS "Position" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "interviewFlowId" INTEGER NOT NULL,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'Draft',
  "isVisible" BOOLEAN NOT NULL DEFAULT FALSE,
  "location" TEXT NOT NULL,
  "jobDescription" TEXT NOT NULL,
  "requirements" TEXT,
  "responsibilities" TEXT,
  "salaryMin" DOUBLE PRECISION,
  "salaryMax" DOUBLE PRECISION,
  "employmentType" VARCHAR(100),
  "benefits" TEXT,
  "companyDescription" TEXT,
  "applicationDeadline" TIMESTAMP(3),
  "contactInfo" TEXT,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "Position"
    ADD CONSTRAINT "Position_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "Position"
    ADD CONSTRAINT "Position_interviewFlowId_fkey"
    FOREIGN KEY ("interviewFlowId") REFERENCES "InterviewFlow" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Position_companyId_idx" ON "Position" ("companyId");
CREATE INDEX IF NOT EXISTS "Position_interviewFlowId_idx" ON "Position" ("interviewFlowId");

CREATE TABLE IF NOT EXISTS "Application" (
  "id" SERIAL NOT NULL,
  "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currentInterviewStep" INTEGER NOT NULL,
  "notes" TEXT,
  "positionId" INTEGER NOT NULL,
  "candidateId" TEXT NOT NULL,
  "interviewStepId" INTEGER NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "Application"
    ADD CONSTRAINT "Application_positionId_fkey"
    FOREIGN KEY ("positionId") REFERENCES "Position" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "Application"
    ADD CONSTRAINT "Application_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "Application"
    ADD CONSTRAINT "Application_interviewStepId_fkey"
    FOREIGN KEY ("interviewStepId") REFERENCES "InterviewStep" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Application_positionId_idx" ON "Application" ("positionId");
CREATE INDEX IF NOT EXISTS "Application_candidateId_idx" ON "Application" ("candidateId");
CREATE INDEX IF NOT EXISTS "Application_interviewStepId_idx" ON "Application" ("interviewStepId");

CREATE TABLE IF NOT EXISTS "Interview" (
  "id" SERIAL NOT NULL,
  "interviewDate" TIMESTAMP(3) NOT NULL,
  "result" TEXT,
  "score" INTEGER,
  "notes" TEXT,
  "applicationId" INTEGER NOT NULL,
  "interviewStepId" INTEGER NOT NULL,
  "employeeId" INTEGER NOT NULL,
  CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "Interview"
    ADD CONSTRAINT "Interview_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "Interview"
    ADD CONSTRAINT "Interview_interviewStepId_fkey"
    FOREIGN KEY ("interviewStepId") REFERENCES "InterviewStep" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "Interview"
    ADD CONSTRAINT "Interview_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Interview_applicationId_idx" ON "Interview" ("applicationId");
CREATE INDEX IF NOT EXISTS "Interview_interviewStepId_idx" ON "Interview" ("interviewStepId");
CREATE INDEX IF NOT EXISTS "Interview_employeeId_idx" ON "Interview" ("employeeId");
