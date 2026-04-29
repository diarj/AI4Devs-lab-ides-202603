import { validateCreateCandidateInput } from './validator';
import { ValidationError } from './errors/ValidationError';

describe('validateCreateCandidateInput', () => {
  it('should accept valid required fields only', () => {
    const result = validateCreateCandidateInput({
      firstName: ' Ana ',
      lastName: ' Lopez ',
      email: 'ana.lopez@example.com',
    });
    expect(result).toEqual({
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana.lopez@example.com',
      phone: null,
      address: null,
      education: null,
      workExperience: null,
    });
  });

  it('should reject missing required fields with field details', () => {
    expect(() => validateCreateCandidateInput({})).toThrow(ValidationError);
    try {
      validateCreateCandidateInput({});
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const ve = e as ValidationError;
      const fields = ve.details?.map((d) => d.field) ?? [];
      expect(fields).toEqual(expect.arrayContaining(['email', 'firstName', 'lastName']));
    }
  });

  it('should reject invalid email format', () => {
    expect(() =>
      validateCreateCandidateInput({
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'not-an-email',
      }),
    ).toThrow(ValidationError);
  });

  it('should reject invalid phone format', () => {
    expect(() =>
      validateCreateCandidateInput({
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        phone: 'abc',
      }),
    ).toThrow(ValidationError);
  });

  it('should accept E.164-compatible phone', () => {
    const result = validateCreateCandidateInput({
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      phone: '+1 415 555 0100',
    });
    expect(result.phone).toBe('+14155550100');
  });
});
