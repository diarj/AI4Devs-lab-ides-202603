# Backend Implementation Plan: USER-STORY Add Candidate to ATS

## 1. Header
- **Ticket ID**: `USER-STORY`
- **Feature**: Add Candidate to ATS
- **Goal**: Implement a secure, validated backend flow to create candidates from recruiter dashboard, optionally upload CV files (`.pdf`/`.docx`), and persist candidate plus document metadata.

## 2. Overview
This plan delivers a DDD-aligned backend implementation for candidate intake using the project stack (TypeScript, Express, Prisma, PostgreSQL), following layered responsibilities:
- **Presentation layer** handles HTTP, multipart parsing, and response mapping.
- **Application layer** validates input, orchestrates upload + persistence transaction, and maps domain/infrastructure errors to API responses.
- **Domain layer** encapsulates candidate/document entities and repository contracts.
- **Infrastructure layer** implements persistence and storage integration details.

The implementation prioritizes validation, authorization, secure file handling, transactional consistency, and standardized error responses.

## 3. Architecture Context
- **Domain** (`backend/src/domain/`):
  - `models/Candidate.ts`
  - `models/CandidateDocument.ts`
  - `repositories/ICandidateRepository.ts`
  - `repositories/ICandidateDocumentRepository.ts`
- **Application** (`backend/src/application/`):
  - `dto/createCandidateInput.ts`
  - `validator.ts` (extend with `validateCreateCandidateInput`)
  - `services/candidateService.ts`
  - `errors/` (validation, upload, authorization, persistence error abstractions)
- **Presentation** (`backend/src/presentation/` and `backend/src/routes/`):
  - `controllers/candidateController.ts`
  - `routes/candidateRoutes.ts`
  - `middleware/uploadMiddleware.ts`
  - `middleware/authMiddleware.ts` (or reuse existing role middleware if present)
- **Infrastructure** (`backend/src/infrastructure/`):
  - `prismaClient.ts` (if not yet extracted from `index.ts`)
  - `repositories/prismaCandidateRepository.ts`
  - `repositories/prismaCandidateDocumentRepository.ts`
  - `storage/documentStorageService.ts`
- **Database**:
  - `backend/prisma/schema.prisma`
  - `backend/prisma/migrations/*`
- **App wiring**:
  - `backend/src/index.ts`
- **Tests**:
  - `backend/src/**/__tests__/*.test.ts` (or existing test location convention)

## 4. Implementation Steps

### Step 0: Create Feature Branch
- **Action**: Create and switch to dedicated backend branch before making code changes.
- **Branch Naming (required)**: `feature/user-story-backend`
- **Implementation Steps**:
  1. Checkout base branch (`main` or agreed integration branch).
  2. Pull latest changes.
  3. Create and switch: `git checkout -b feature/user-story-backend`.
  4. Verify branch is active with `git branch`.
- **Notes**: Must be first step per backend workflow standards.

### Step 1: Model Data in Prisma (Candidate + CandidateDocument)
- **File**: `backend/prisma/schema.prisma`
- **Action**: Add models and relations for candidate records and CV metadata.
- **Function Signature**: N/A (schema update)
- **Implementation Steps**:
  1. Add `Candidate` model:
     - `id` (string UUID or project-convention ID)
     - `firstName`, `lastName`, `email` (required)
     - `phone`, `address`, `education`, `workExperience` (nullable)
     - `createdBy` (string/int according to auth user ID type)
     - `createdAt`, `updatedAt`
  2. Add `CandidateDocument` model:
     - `id`
     - `candidateId` (FK to `Candidate`)
     - `documentType` (`CV` enum)
     - `fileName`, `mimeType`, `fileSize`, `storageKey` (or `secureUrl`)
     - `uploadedAt`
  3. Add index on `Candidate.email`.
  4. Add relation + FK constraints with cascade behavior defined explicitly.
  5. Generate migration with descriptive name (`add_candidate_and_candidate_document`).
- **Dependencies**: Prisma CLI, PostgreSQL.
- **Implementation Notes**:
  - Prefer `storageKey` in DB and generate signed/protected URLs at read time.
  - Keep PII columns encrypted at rest via infrastructure/cloud configuration.

### Step 2: Introduce Domain Models and Repository Contracts
- **File**: 
  - `backend/src/domain/models/Candidate.ts`
  - `backend/src/domain/models/CandidateDocument.ts`
  - `backend/src/domain/repositories/ICandidateRepository.ts`
  - `backend/src/domain/repositories/ICandidateDocumentRepository.ts`
- **Action**: Define typed domain entities and repository interfaces.
- **Function Signature**:
  - `create(candidate: Candidate): Promise<Candidate>`
  - `create(document: CandidateDocument): Promise<CandidateDocument>`
  - Optional transaction-aware methods depending on architecture.
- **Implementation Steps**:
  1. Add `Candidate` entity type/class with strict required vs optional fields.
  2. Add `CandidateDocument` entity type/class linked to candidate.
  3. Define repository interfaces without Prisma coupling.
  4. Add domain-safe constructors/factories enforcing required invariants.
- **Dependencies**: TypeScript strict typings.
- **Implementation Notes**:
  - Avoid embedding framework concerns in domain models.
  - Prepare for transactional creation of candidate + optional document.

### Step 3: Build Validation Layer for Create Candidate
- **File**:
  - `backend/src/application/validator.ts` (extend)
  - `backend/src/application/dto/createCandidateInput.ts`
- **Action**: Add centralized input validation for body fields and business rules.
- **Function Signature**:
  - `validateCreateCandidateInput(raw: unknown): CreateCandidateInput`
- **Implementation Steps**:
  1. Validate required fields: `firstName`, `lastName`, `email`.
  2. Validate email format with robust regex or trusted validation utility.
  3. Validate optional `phone` against basic E.164-compatible pattern.
  4. Enforce length limits for all text fields.
  5. Trim/sanitize string input and normalize empty optional strings to `null`.
  6. Return typed object or throw structured validation error with field details.
- **Dependencies**: Existing validator module patterns; optional schema library if adopted.
- **Implementation Notes**:
  - Keep validation deterministic and reusable in service/controller tests.
  - Include both extension and MIME checks for uploaded files (paired with upload middleware).

### Step 4: Add Multipart Upload Middleware with File Guards
- **File**: `backend/src/presentation/middleware/uploadMiddleware.ts`
- **Action**: Implement multipart parsing and file constraints for `cvFile`.
- **Function Signature**:
  - `cvUploadMiddleware: RequestHandler`
- **Implementation Steps**:
  1. Add upload library (e.g., `multer`) if not present.
  2. Configure accepted MIME and extension whitelist:
     - PDF: `application/pdf`
     - DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  3. Enforce configurable max size (`CV_MAX_SIZE_MB`, default 5MB).
  4. Reject unsupported type (`415`) with user-friendly message.
  5. Map size overflow to `413`.
  6. Ensure temporary file handling strategy does not leak files on failures.
- **Dependencies**: `multer` (and type packages).
- **Implementation Notes**:
  - Validate both MIME and extension; do not trust extension only.
  - Keep upload errors mapped to standard API error envelope.

### Step 5: Implement Storage Service Abstraction
- **File**: `backend/src/infrastructure/storage/documentStorageService.ts`
- **Action**: Add secure storage adapter for CV uploads.
- **Function Signature**:
  - `uploadCv(input: { candidateId: string; file: UploadedFile }): Promise<{ storageKey: string; secureUrl?: string }>`
- **Implementation Steps**:
  1. Create storage interface + implementation (S3/local protected bucket by env).
  2. Generate deterministic storage key (e.g., `candidates/{candidateId}/cv/{timestamp}_{safeName}`).
  3. Store metadata required for persistence (`fileName`, `mimeType`, `size`, `storageKey`).
  4. Return storage key (and secure URL if model requires it).
  5. Handle upload failures with typed infrastructure errors.
- **Dependencies**: Storage SDK (if cloud-backed).
- **Implementation Notes**:
  - Ensure access control is authenticated/authorized.
  - Do not expose raw bucket paths publicly.

### Step 6: Implement Candidate Creation Service (Transactional)
- **File**: `backend/src/application/services/candidateService.ts`
- **Action**: Orchestrate validation, optional file upload, and transactional persistence.
- **Function Signature**:
  - `createCandidate(input: CreateCandidateInput, actor: AuthUser, cvFile?: UploadedFile): Promise<CreateCandidateResult>`
- **Implementation Steps**:
  1. Authorize actor role (`recruiter`) before write operation.
  2. Validate and sanitize `input` via application validator.
  3. Create candidate aggregate/entity with `createdBy`.
  4. If file is present:
     - Upload file to secure storage.
     - Build `CandidateDocument` entity from upload metadata.
  5. Persist candidate and document metadata within a DB transaction boundary.
  6. Return API-facing DTO including `id`, candidate fields, `cv` object, and `createdAt`.
  7. Map known failures to typed errors:
     - Validation (`400`)
     - Payload too large (`413`)
     - Unsupported media (`415`)
     - Auth (`403`)
     - Unexpected (`500`)
- **Dependencies**: repositories, storage service, prisma transaction support.
- **Implementation Notes**:
  - Define compensation/cleanup policy if upload succeeds but DB transaction fails.
  - Preserve idempotency expectations at API layer as future enhancement.

### Step 7: Create Controller + Route for `POST /api/candidates`
- **File**:
  - `backend/src/presentation/controllers/candidateController.ts`
  - `backend/src/routes/candidateRoutes.ts`
  - `backend/src/index.ts` (route registration and middlewares)
- **Action**: Expose endpoint with middleware chain and standardized responses.
- **Function Signature**:
  - `createCandidateHandler(req: Request, res: Response, next: NextFunction): Promise<void>`
- **Implementation Steps**:
  1. Parse multipart form fields and optional `cvFile`.
  2. Extract authenticated user from request context.
  3. Delegate business logic to `candidateService.createCandidate`.
  4. Return `201` success payload exactly aligned with proposed contract.
  5. Delegate failures to global error middleware for consistent envelope.
  6. Mount route under `/api/candidates`.
- **Dependencies**: auth middleware, upload middleware, service layer.
- **Implementation Notes**:
  - Keep controller thin; no business logic in controller.
  - Existing `index.ts` currently has minimal setup; include JSON parsing, route mounting, and improved error middleware.

### Step 8: Standardize Error Response Mapping
- **File**:
  - `backend/src/presentation/middleware/errorHandler.ts` (new) or `index.ts` middleware refactor
  - `backend/src/application/errors/*`
- **Action**: Enforce consistent JSON error format and HTTP mappings.
- **Function Signature**:
  - `errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void`
- **Implementation Steps**:
  1. Introduce base `AppError` with `code`, `status`, `details`.
  2. Add typed errors (`ValidationError`, `UnsupportedMediaTypeError`, etc.).
  3. Map upload library errors to typed app errors.
  4. Return non-technical user-friendly messages; include field-level details when useful.
  5. Avoid logging full PII payloads.
- **Dependencies**: logger utility.
- **Implementation Notes**:
  - Replace current plain-text `"Something broke!"` response with JSON envelope.

### Step 9: Add Tests (TDD-aligned and Coverage-focused)
- **File**:
  - `backend/src/application/services/__tests__/candidateService.test.ts`
  - `backend/src/presentation/controllers/__tests__/candidateController.test.ts`
  - `backend/src/routes/__tests__/candidateRoutes.integration.test.ts`
  - `backend/src/tests/app.test.ts` (update baseline route assertions)
- **Action**: Add unit and integration tests for success/failure paths.
- **Function Signature**: N/A (test suite)
- **Implementation Steps**:
  1. **Service tests**:
     - success with no file
     - success with valid PDF/DOCX
     - validation errors (missing required, bad email, bad phone, length overflow)
     - storage upload failure
     - repository transaction failure
     - unauthorized actor
  2. **Controller tests**:
     - multipart parsing + service invocation
     - error propagation and status mapping
  3. **Integration tests**:
     - `POST /api/candidates` returns `201` on valid payload
     - returns `400`, `413`, `415`, `403`, `500` as applicable
  4. Ensure tests follow AAA pattern and naming convention.
  5. Maintain >=90% coverage for affected modules.
- **Dependencies**: Jest, Supertest, mocks for storage + repositories.
- **Implementation Notes**:
  - Add fixtures/builders for candidate input and file metadata.

### Step 10: Update Technical Documentation (Mandatory)
- **File**:
  - `docs/api-spec.yml`
  - `README.md` (or recruiter workflow docs)
  - `docs/data-model.md`
  - `docs/testing-notes.md` (if existing; otherwise append to README/docs section)
- **Action**: Document endpoint, schema, validation rules, errors, and test guidance.
- **Implementation Steps**:
  1. Add `POST /api/candidates` contract and examples.
  2. Add request multipart details (fields + file constraints).
  3. Add error-code reference (`400`, `413`, `415`, `500`, `403`).
  4. Update data model docs for candidate/document tables and relations.
  5. Add QA notes for browser/accessibility checks from end-to-end perspective.
- **References**: `docs/documentation-standards.mdc`
- **Notes**: Required before considering implementation complete.

## 5. Implementation Order
1. Step 0: Create feature branch (`feature/user-story-backend`)
2. Step 1: Update Prisma schema + migration
3. Step 2: Add domain models and repository contracts
4. Step 3: Add input validation DTOs
5. Step 4: Add upload middleware and file guards
6. Step 5: Add secure storage service
7. Step 6: Implement transactional application service
8. Step 7: Add controller, route, and app wiring
9. Step 8: Standardize error response middleware
10. Step 9: Add/adjust tests (unit + integration)
11. Step 10: Update technical documentation

## 6. Testing Checklist
- `POST /api/candidates` success without CV.
- `POST /api/candidates` success with valid PDF.
- `POST /api/candidates` success with valid DOCX.
- Required field validation errors return `400` with details.
- Invalid email returns `400`.
- Invalid phone (non E.164-compatible) returns `400`.
- Oversized file returns `413`.
- Unsupported media type returns `415`.
- Unauthorized recruiter action returns `403`.
- Unexpected failures return `500` with safe generic message.
- Candidate and candidate document metadata persisted correctly.
- No plain-text PII leakage in logs during error scenarios.

## 7. Error Response Format
Standard error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "email", "message": "Invalid email format." }
    ]
  }
}
```

HTTP mapping:
- `400` `VALIDATION_ERROR`
- `403` `FORBIDDEN`
- `413` `FILE_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `500` `INTERNAL_ERROR`

## 8. Partial Update Support
Not applicable for this ticket. This feature is create-only (`POST /api/candidates`). Partial update semantics (`PATCH`) are deferred to a future ticket.

## 9. Dependencies
- Runtime:
  - `express`
  - `@prisma/client`
  - `dotenv`
  - `multer` (new, for multipart file uploads)
- Development:
  - `prisma`
  - `jest`
  - `supertest`
  - `ts-jest`
  - `@types/multer` (if required by chosen upload library)
- External services:
  - Secure document storage provider (S3-compatible or equivalent)

## 10. Notes
- Use English in all code, errors, docs, and tests.
- Apply TDD: start with failing tests for validator/service/controller flows.
- Keep implementation incremental and layered (no business logic in controllers).
- Ensure upload restrictions use both extension and MIME validation.
- Enforce controlled access to stored CVs (authenticated retrieval, signed URL, or proxy endpoint).
- Keep API response schema stable for frontend consumption and UI feedback.

## 11. Next Steps After Implementation
- Run full backend test suite and coverage.
- Validate migration rollout strategy in non-production and production environments.
- Coordinate frontend integration for form submission, error handling, and success messaging.
- Perform QA regression on recruiter flow and upload behavior.
- Prepare release notes including endpoint and schema additions.

## 12. Implementation Verification
- **Code Quality**
  - TypeScript compiles cleanly.
  - ESLint passes for new/changed files.
- **Functionality**
  - All acceptance criteria validated end-to-end.
- **Testing**
  - Unit + integration tests green.
  - Coverage meets project threshold for modified modules.
- **Integration**
  - Endpoint wired and reachable from recruiter dashboard flow.
  - Storage integration validated in target environment.
- **Documentation**
  - API spec, data model, and workflow docs updated and reviewed.

