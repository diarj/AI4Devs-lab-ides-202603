# Frontend Implementation Plan: USER-STORY Add Candidate to ATS

## 1. Overview

This plan defines the frontend implementation for adding a candidate from the recruiter dashboard with validated intake data, optional CV upload, and clear user feedback. The implementation follows the project frontend principles: component-based React architecture, a dedicated service layer for API communication, typed contracts for payloads/responses, and incremental delivery with tests first (TDD).

## 2. Architecture Context

- Components/services involved:
  - Dashboard action area (Add Candidate CTA)
  - Candidate creation page/modal component
  - Reusable candidate form component (controlled inputs + validation rendering)
  - Candidate API service in `frontend/src/services/`
  - Shared validation utilities/constants for field limits and file constraints
- Files referenced (expected):
  - `frontend/src/App.js` (or router module currently used)
  - `frontend/src/components/` (dashboard + candidate form/page components)
  - `frontend/src/services/` (candidate creation request)
  - `frontend/src/assets/` or style modules for focus/error states (if needed)
  - `frontend/src/**/*.test.*` (unit/component tests)
  - `frontend/cypress/e2e/` (E2E workflow coverage)
- Routing considerations:
  - Add route entry from recruiter dashboard to candidate creation UI (page route preferred for larger form workflow).
  - Ensure back navigation to dashboard after submit/cancel.
- State management approach:
  - Local state with React hooks (`useState`, `useEffect` only where needed).
  - Controlled form state object with field-level touched/errors map.
  - Dedicated submission state (`idle | submitting | success | error`) and error category mapping (validation/server/network).

## 3. Implementation Steps

### Step 0: Create Feature Branch
- **Action**: Create and switch to a new frontend-specific branch before any code changes.
- **Branch Naming**: `feature/user-story-frontend` (required `-frontend` suffix).
- **Implementation Steps**:
  1. Checkout base branch (`main` or `develop`, according to team flow).
  2. Pull latest changes from remote base branch.
  3. Create branch: `git checkout -b feature/user-story-frontend`.
  4. Verify active branch with `git branch`.
- **Notes**: Mandatory first step per frontend workflow rules.

### Step 1: Define Frontend Domain Types, Constraints, and Validation Rules (TDD first)
- **File**: `frontend/src/components/candidates/` (new type/validation modules) and corresponding test files.
- **Action**: Add typed structures and pure validation helpers before UI wiring.
- **Function/Component Signature**:
  - `type CreateCandidateFormData = { ... }`
  - `type FieldErrors = Partial<Record<keyof CreateCandidateFormData | 'cvFile', string>>`
  - `validateCandidateForm(data: CreateCandidateFormData, file?: File): FieldErrors`
- **Implementation Steps**:
  1. Create unit tests for required fields, email format, phone format (basic E.164 compatible), max length limits, and file type/size checks.
  2. Implement constants for constraints (max lengths, accepted MIME/extensions, default max file size = 5 MB configurable via env).
  3. Implement validator utilities so tests pass.
  4. Ensure validator output supports inline field-level rendering.
- **Dependencies**:
  - Jest + React Testing Library test utilities already in project.
- **Implementation Notes**:
  - Keep validation logic deterministic and isolated from component rendering.
  - Validate both extension and MIME on client as a UX filter (backend remains authoritative).

### Step 2: Add Candidate Service Layer Method
- **File**: `frontend/src/services/candidateService.ts` (or existing candidates service module).
- **Action**: Implement API method for `POST /api/candidates` with multipart payload.
- **Function/Component Signature**:
  - `createCandidate(formData: CreateCandidateFormData, cvFile?: File): Promise<CreateCandidateResponse>`
- **Implementation Steps**:
  1. Add service tests/mocks for success, `400`, `413`, `415`, `500`, and network errors.
  2. Build `FormData` payload mapping frontend field names to API contract fields.
  3. Implement standardized error mapper from HTTP/network failures to UI-friendly error model.
  4. Export service method for component usage.
- **Dependencies**:
  - `axios` client instance or existing HTTP utility wrapper.
- **Implementation Notes**:
  - Never log raw candidate PII in console logs.
  - Keep transport concerns in service (component only consumes typed result/error model).

### Step 3: Add Dashboard CTA and Navigation
- **File**: Dashboard component file(s), likely in `frontend/src/components/`.
- **Action**: Introduce prominent primary action to start candidate creation flow.
- **Function/Component Signature**:
  - `handleAddCandidateClick(): void`
- **Implementation Steps**:
  1. Add "Add Candidate" button styled as primary action.
  2. Add `aria-label` if button text alone is insufficient in context.
  3. Wire route navigation to candidate creation page/modal.
  4. Add/adjust tests to verify CTA visibility and navigation behavior.
- **Dependencies**:
  - `react-router-dom` (`useNavigate` or `<Link>`).
- **Implementation Notes**:
  - Ensure keyboard focus order is natural and CTA is reachable without mouse.

### Step 4: Build Candidate Creation UI (Form + Upload + Feedback)
- **File**: `frontend/src/components/candidates/AddCandidatePage.tsx` (or project naming equivalent), plus optional child form component.
- **Action**: Implement complete intake form and submit flow.
- **Function/Component Signature**:
  - `const AddCandidatePage: React.FC = () => { ... }`
  - `const CandidateForm: React.FC<CandidateFormProps> = (...) => { ... }` (optional split)
- **Implementation Steps**:
  1. Create controlled fields for required and optional inputs, including multiline text areas for education/workExperience.
  2. Attach validation on blur and submit; block submit when validation fails.
  3. Add file input for CV with accept filter (`.pdf,.docx`) and pre-submit size/type checks.
  4. Call `candidateService.createCandidate(...)` on valid submit.
  5. Show loading state and disable submit while request is in progress.
  6. On success, show confirmation with candidate reference/id and reset only when desired by UX.
  7. On recoverable failures, preserve field data and file selection where browser allows.
  8. Render actionable non-technical error messages by category (validation/server/network).
- **Dependencies**:
  - React Bootstrap form components (if used in existing UI conventions).
- **Implementation Notes**:
  - Ensure labels, placeholders, and inline errors are clear and consistent.
  - Use `aria-invalid`, `aria-describedby`, and role/status regions for error/success messaging.

### Step 5: Update Routing Integration
- **File**: `frontend/src/App.js` (or central routes file).
- **Action**: Register route/modal entry and ensure navigation continuity.
- **Function/Component Signature**:
  - Route declaration for candidate creation view.
- **Implementation Steps**:
  1. Add route path for candidate creation screen.
  2. Ensure guard or layout compatibility for recruiter dashboard context.
  3. Add fallback navigation behavior for cancel/back actions.
  4. Add route-level test coverage (render + navigation).
- **Dependencies**:
  - Existing router configuration and layout wrappers.
- **Implementation Notes**:
  - Keep route naming consistent with existing candidate/recruiter paths.

### Step 6: Accessibility and Compatibility Hardening
- **File**: Candidate form component(s), shared styles.
- **Action**: Implement and verify baseline WCAG 2.1 AA-friendly behavior.
- **Function/Component Signature**:
  - N/A (cross-cutting updates).
- **Implementation Steps**:
  1. Verify all inputs have explicit labels and linked helper/error text.
  2. Confirm keyboard-only completion of full flow (open form, edit, upload, submit, recover errors).
  3. Ensure visible focus styling and sufficient contrast in normal/error/success states.
  4. Add automated checks where available and manual verification notes for Chrome/Edge/Firefox/Safari.
- **Dependencies**:
  - Existing styling framework and test utilities.
- **Implementation Notes**:
  - Prefer semantic HTML + native form behavior before custom key handlers.

### Step 7: Add Component/Integration and E2E Tests
- **File**:
  - `frontend/src/components/candidates/*.test.tsx`
  - `frontend/cypress/e2e/candidates.cy.ts` (or feature-specific file).
- **Action**: Cover acceptance criteria end-to-end.
- **Function/Component Signature**:
  - Test suites for validation, submission, and feedback states.
- **Implementation Steps**:
  1. Component tests:
     - required field blocking
     - invalid email and phone messaging
     - file validation (type/size)
     - submit loading state
     - success message with identifier
     - recoverable error keeps data
  2. Service tests:
     - API response mapping for `201`, `400`, `413`, `415`, `500`, and network failures
  3. Cypress tests:
     - dashboard CTA visible and navigates
     - valid submission flow
     - invalid form prevents submit
     - unsupported file rejected with friendly message
  4. Use stable selectors (`data-testid`) where needed.
- **Dependencies**:
  - Cypress config and API stubbing/fixture strategy currently used in project.
- **Implementation Notes**:
  - Keep test names behavior-focused and in English.

### Step 8: Update Technical Documentation
- **Action**: Review and update frontend/API/user-flow documentation affected by this feature.
- **Implementation Steps**:
  1. **Review Changes**: Identify all user-visible and API-contract-related updates from implementation.
  2. **Identify Documentation Files**:
     - `docs/api-spec.yml` for candidate creation contract and error responses
     - `README.md` and/or recruiter workflow docs for new dashboard flow
     - `docs/frontend-standards.mdc` only if new frontend pattern/convention is introduced
  3. **Update Documentation** in English and consistent format.
  4. **Verify Documentation** for accuracy and completeness.
  5. **Report Updates** in PR summary/checklist.
- **References**:
  - `docs/documentation-standards.mdc`
- **Notes**: Mandatory completion step before closing the ticket.

## 4. Implementation Order

1. Step 0: Create Feature Branch
2. Step 1: Define Types/Validation Rules (with failing tests first)
3. Step 2: Add Candidate Service Method
4. Step 3: Add Dashboard CTA and Navigation
5. Step 4: Build Candidate Creation UI
6. Step 5: Update Routing Integration
7. Step 6: Accessibility and Compatibility Hardening
8. Step 7: Add Component/Integration and E2E Tests
9. Step 8: Update Technical Documentation

## 5. Testing Checklist

- Unit tests for field validation (required, email, phone, max lengths).
- Unit tests for file validation (extension/MIME/size).
- Component tests for submit state machine (idle/loading/success/error).
- Service tests for API error-code mapping (`400`, `413`, `415`, `500`, network).
- Cypress test for dashboard CTA to form navigation.
- Cypress test for happy-path candidate creation with PDF/DOCX upload.
- Cypress test for invalid submission blocks and inline errors.
- Cypress test for recoverable failure with form data preserved.
- Manual keyboard-only flow verification.
- Manual browser smoke tests on latest Chrome/Edge/Firefox/Safari.

## 6. Error Handling Patterns

- Use field-level inline errors for validation failures and a top-level alert for submission failures.
- Map backend errors to actionable language:
  - `400`: show field-specific and/or form guidance.
  - `413`: "File exceeds maximum allowed size."
  - `415`: "Only PDF and DOCX files are supported."
  - `500`/network: retry-friendly generic message without technical details.
- Preserve user-entered data on recoverable errors to reduce rework.
- Keep logs minimal and avoid exposing candidate PII.

## 7. UI/UX Considerations

- Primary "Add Candidate" CTA must be visually prominent on dashboard.
- Candidate form uses clear labels/placeholders and consistent required markers.
- Multiline inputs for education and work experience with helpful placeholders.
- Submit button disabled while submitting; show progress text/spinner.
- Success feedback includes candidate identifier/reference.
- Focus management:
  - Move focus to first invalid field on submit failure.
  - Move focus to success/error alert on response.
- Baseline WCAG 2.1 AA compliance for contrast and focus indicators.

## 8. Dependencies

- Existing frontend dependencies:
  - React + React Router DOM
  - Axios
  - React Bootstrap (if already used in related screens)
  - Jest + React Testing Library
  - Cypress
- Optional additions only if required by current codebase patterns:
  - Client-side schema validation library (if already standardized in project).

## 9. Notes

- Language for UI text, code, tests, and docs must be English only.
- Implement frontend as fully typed modules/interfaces for new files.
- Respect backend authority: frontend validation improves UX but does not replace server validation.
- File size limit should come from configurable constant/env with 5 MB default.
- Do not include CV parsing or AI deduplication in this ticket.
- Keep change scope focused and incremental to simplify review.

## 10. Next Steps After Implementation

- Run full frontend test suite and fix regressions.
- Run Cypress targeted suite for candidate flow.
- Validate with product/QA on UX and error messaging behavior.
- Coordinate backend contract verification if response shape differs from proposed spec.
- Prepare PR with checklist mapped to acceptance criteria.

## 11. Implementation Verification

- **Code Quality**
  - New code follows naming, typing, and service/component separation standards.
  - No lint/type errors introduced.
- **Functionality**
  - Dashboard CTA opens candidate creation flow.
  - Form enforces required fields and format/length constraints.
  - CV upload accepts only PDF/DOCX within size limits.
  - Successful submit shows candidate reference.
  - Recoverable errors show actionable message and allow retry.
- **Testing**
  - Unit/component/service tests added and passing.
  - Cypress flow coverage added and passing.
- **Integration**
  - Frontend payload matches backend multipart contract.
  - Router and dashboard integration behave correctly.
- **Documentation**
  - `docs/api-spec.yml` and workflow docs updated when implementation completes.
