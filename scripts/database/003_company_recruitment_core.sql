-- 003_company_recruitment_core.sql
-- Source: docs/data-model.md sections 5–9 (Company, Employee, InterviewType, InterviewFlow, InterviewStep)

CREATE TABLE IF NOT EXISTS "Company" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Company_name_key" ON "Company" ("name");

CREATE TABLE IF NOT EXISTS "Employee" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "companyId" INTEGER NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee" ("email");

DO $$
BEGIN
  ALTER TABLE "Employee"
    ADD CONSTRAINT "Employee_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "Employee_companyId_idx" ON "Employee" ("companyId");

CREATE TABLE IF NOT EXISTS "InterviewType" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "InterviewType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewFlow" (
  "id" SERIAL NOT NULL,
  "description" TEXT,
  CONSTRAINT "InterviewFlow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewStep" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "interviewFlowId" INTEGER NOT NULL,
  "interviewTypeId" INTEGER NOT NULL,
  CONSTRAINT "InterviewStep_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "InterviewStep"
    ADD CONSTRAINT "InterviewStep_interviewFlowId_fkey"
    FOREIGN KEY ("interviewFlowId") REFERENCES "InterviewFlow" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "InterviewStep"
    ADD CONSTRAINT "InterviewStep_interviewTypeId_fkey"
    FOREIGN KEY ("interviewTypeId") REFERENCES "InterviewType" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "InterviewStep_flow_idx" ON "InterviewStep" ("interviewFlowId");
CREATE INDEX IF NOT EXISTS "InterviewStep_type_idx" ON "InterviewStep" ("interviewTypeId");
