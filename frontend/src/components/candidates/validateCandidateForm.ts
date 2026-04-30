import {
  ALLOWED_CV_MIME,
  CANDIDATE_FIELD_LIMITS,
  EMAIL_PATTERN,
  getMaxCvBytes,
} from './candidateFormConstants';
import type { CandidateFieldErrors, CreateCandidateFormData } from './candidateFormTypes';

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

function allowedCvExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.pdf') || lower.endsWith('.docx');
}

/**
 * Client-side validation aligned with backend rules.
 * Returns a map of field keys to a single error message (first issue wins per field).
 */
export function validateCandidateForm(
  data: CreateCandidateFormData,
  cvFile?: File | null,
): CandidateFieldErrors {
  const errors: CandidateFieldErrors = {};

  const firstName = data.firstName.trim();
  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length > CANDIDATE_FIELD_LIMITS.firstName) {
    errors.firstName = `Must not exceed ${CANDIDATE_FIELD_LIMITS.firstName} characters.`;
  }

  const lastName = data.lastName.trim();
  if (!lastName) {
    errors.lastName = 'Last name is required.';
  } else if (lastName.length > CANDIDATE_FIELD_LIMITS.lastName) {
    errors.lastName = `Must not exceed ${CANDIDATE_FIELD_LIMITS.lastName} characters.`;
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (email.length > CANDIDATE_FIELD_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Invalid email format.';
  }

  const phoneRaw = data.phone.trim();
  if (phoneRaw) {
    if (phoneRaw.length > CANDIDATE_FIELD_LIMITS.phone) {
      errors.phone = `Must not exceed ${CANDIDATE_FIELD_LIMITS.phone} characters.`;
    } else {
      const normalized = normalizePhoneDigits(phoneRaw);
      if (!isE164Compatible(normalized)) {
        errors.phone = 'Phone must use an international format (E.164-compatible).';
      }
    }
  }

  const address = data.address.trim();
  if (address.length > CANDIDATE_FIELD_LIMITS.address) {
    errors.address = `Must not exceed ${CANDIDATE_FIELD_LIMITS.address} characters.`;
  }

  const education = data.education.trim();
  if (education.length > CANDIDATE_FIELD_LIMITS.education) {
    errors.education = `Must not exceed ${CANDIDATE_FIELD_LIMITS.education} characters.`;
  }

  const workExperience = data.workExperience.trim();
  if (workExperience.length > CANDIDATE_FIELD_LIMITS.workExperience) {
    errors.workExperience = `Must not exceed ${CANDIDATE_FIELD_LIMITS.workExperience} characters.`;
  }

  if (cvFile) {
    const maxBytes = getMaxCvBytes();
    if (!allowedCvExtension(cvFile.name)) {
      errors.cvFile = 'Only PDF and DOCX files are supported.';
    } else if (!ALLOWED_CV_MIME.has(cvFile.type)) {
      errors.cvFile = 'Only PDF and DOCX files are supported.';
    } else if (cvFile.size > maxBytes) {
      errors.cvFile = 'File exceeds maximum allowed size.';
    }
  }

  return errors;
}

export function hasFieldErrors(errors: CandidateFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
