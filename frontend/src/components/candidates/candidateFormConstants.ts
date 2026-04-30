/** Mirrors backend `LIMITS` in `backend/src/application/validator.ts`. */
export const CANDIDATE_FIELD_LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 32,
  address: 2000,
  education: 10000,
  workExperience: 10000,
} as const;

export const ALLOWED_CV_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/** Same subset as backend email pattern. */
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function getMaxCvBytes(): number {
  const fromBytes = process.env.REACT_APP_CV_MAX_UPLOAD_BYTES;
  if (fromBytes !== undefined && fromBytes !== '') {
    const parsed = Number.parseInt(fromBytes, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  const maxMb = Number.parseFloat(process.env.REACT_APP_CV_MAX_SIZE_MB || '5');
  return (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 5) * 1024 * 1024;
}
