export function getApiBaseUrl(): string {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:3010';
  return raw.replace(/\/$/, '');
}

/** MVP recruiter headers; must match an existing `User.id` in the database. */
export function getRecruiterAuthHeaders(): Record<string, string> {
  const userId = process.env.REACT_APP_RECRUITER_USER_ID || '1';
  return {
    'x-user-id': userId,
    'x-user-role': 'recruiter',
  };
}
