import type { CreateCandidateInput } from './dto/createCandidateInput';
import { ValidationError } from './errors/ValidationError';

const LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 32,
  address: 2000,
  education: 10000,
  workExperience: 10000,
} as const;

/** Practical email validation (RFC-style subset). */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function asTrimmedString(value: unknown, field: string): string {
  if (value === undefined || value === null) {
    throw new ValidationError('Validation failed.', [{ field, message: 'Value is required.' }]);
  }
  if (typeof value !== 'string') {
    throw new ValidationError('Validation failed.', [{ field, message: 'Must be a string.' }]);
  }
  return value.trim();
}

function optionalNormalizedText(value: unknown, field: string, maxLen: number): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ValidationError('Validation failed.', [{ field, message: 'Must be a string.' }]);
  }
  const s = value.trim();
  if (!s) {
    return null;
  }
  if (s.length > maxLen) {
    throw new ValidationError('Validation failed.', [
      { field, message: `Must not exceed ${maxLen} characters.` },
    ]);
  }
  return s;
}

function normalizePhoneDigits(value: string): string {
  return value.replace(/[\s().-]/g, '');
}

/** E.164-style: optional leading +, 8–15 digits, first digit country code not 0. */
function isE164Compatible(normalized: string): boolean {
  if (!normalized.startsWith('+')) {
    return /^[1-9]\d{7,14}$/.test(normalized);
  }
  const digits = normalized.slice(1);
  return /^[1-9]\d{7,14}$/.test(digits);
}

export function validateCreateCandidateInput(raw: unknown): CreateCandidateInput {
  if (raw === null || typeof raw !== 'object') {
    throw new ValidationError('Validation failed.', [{ field: 'body', message: 'Expected form fields object.' }]);
  }

  const body = raw as Record<string, unknown>;
  const details: { field: string; message: string }[] = [];

  let firstName = '';
  let lastName = '';
  let email = '';

  try {
    firstName = asTrimmedString(body.firstName, 'firstName');
  } catch (e) {
    if (e instanceof ValidationError && e.details) {
      details.push(...e.details);
    }
  }

  try {
    lastName = asTrimmedString(body.lastName, 'lastName');
  } catch (e) {
    if (e instanceof ValidationError && e.details) {
      details.push(...e.details);
    }
  }

  try {
    email = asTrimmedString(body.email, 'email');
  } catch (e) {
    if (e instanceof ValidationError && e.details) {
      details.push(...e.details);
    }
  }

  if (!firstName) {
    details.push({ field: 'firstName', message: 'First name is required.' });
  } else if (firstName.length > LIMITS.firstName) {
    details.push({ field: 'firstName', message: `Must not exceed ${LIMITS.firstName} characters.` });
  }

  if (!lastName) {
    details.push({ field: 'lastName', message: 'Last name is required.' });
  } else if (lastName.length > LIMITS.lastName) {
    details.push({ field: 'lastName', message: `Must not exceed ${LIMITS.lastName} characters.` });
  }

  if (!email) {
    details.push({ field: 'email', message: 'Email is required.' });
  } else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    details.push({ field: 'email', message: 'Invalid email format.' });
  }

  const phoneRaw = optionalNormalizedText(body.phone, 'phone', LIMITS.phone);
  let phone: string | null = phoneRaw;
  if (phoneRaw) {
    const normalized = normalizePhoneDigits(phoneRaw);
    if (!isE164Compatible(normalized)) {
      details.push({
        field: 'phone',
        message: 'Phone must use an international format (E.164-compatible).',
      });
      phone = null;
    } else {
      phone = normalized;
    }
  }

  const address = optionalNormalizedText(body.address, 'address', LIMITS.address);
  const education = optionalNormalizedText(body.education, 'education', LIMITS.education);
  const workExperience = optionalNormalizedText(body.workExperience, 'workExperience', LIMITS.workExperience);

  if (details.length > 0) {
    throw new ValidationError('One or more fields are invalid.', details);
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    address,
    education,
    workExperience,
  };
}
