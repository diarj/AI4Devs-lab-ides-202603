import { validateCandidateForm, hasFieldErrors } from '../components/candidates/validateCandidateForm';
import { emptyCandidateForm } from '../components/candidates/candidateFormTypes';

describe('validateCandidateForm', () => {
  it('requires firstName, lastName, and email', () => {
    const errors = validateCandidateForm(emptyCandidateForm, null);
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it('rejects invalid email format', () => {
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'A',
        lastName: 'B',
        email: 'not-an-email',
      },
      null,
    );
    expect(errors.email).toMatch(/invalid email/i);
  });

  it('accepts valid minimal data', () => {
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana.lopez@example.com',
      },
      null,
    );
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it('rejects invalid E.164-style phone', () => {
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
        phone: '01234567',
      },
      null,
    );
    expect(errors.phone).toMatch(/international format/i);
  });

  it('accepts E.164-compatible phone with country code', () => {
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
        phone: '+1 415 555 0100',
      },
      null,
    );
    expect(errors.phone).toBeUndefined();
  });

  it('rejects CV with wrong extension', () => {
    const file = new File(['x'], 'cv.txt', { type: 'text/plain' });
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
      },
      file,
    );
    expect(errors.cvFile).toMatch(/pdf|docx/i);
  });

  it('rejects CV over max size', () => {
    const large = new Uint8Array(6 * 1024 * 1024);
    const file = new File([large], 'big.pdf', { type: 'application/pdf' });
    const errors = validateCandidateForm(
      {
        ...emptyCandidateForm,
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
      },
      file,
    );
    expect(errors.cvFile).toMatch(/exceeds maximum/i);
  });
});
