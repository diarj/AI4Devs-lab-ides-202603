import axios, { AxiosError } from 'axios';
import type { CreateCandidateFormData } from '../components/candidates/candidateFormTypes';
import { getApiBaseUrl, getRecruiterAuthHeaders } from './apiEnv';

export type CandidateCvInfo = {
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
};

export type CreateCandidateResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: string | null;
  workExperience: string | null;
  cv: CandidateCvInfo | null;
  createdAt: string;
};

type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
};

export type CandidateSubmitErrorKind = 'validation' | 'client' | 'server';

export class CandidateSubmitError extends Error {
  readonly kind: CandidateSubmitErrorKind;

  readonly fieldErrors: Partial<Record<string, string>>;

  constructor(params: {
    kind: CandidateSubmitErrorKind;
    message: string;
    fieldErrors?: Partial<Record<string, string>>;
  }) {
    super(params.message);
    this.name = 'CandidateSubmitError';
    this.kind = params.kind;
    this.fieldErrors = params.fieldErrors ?? {};
    Object.setPrototypeOf(this, CandidateSubmitError.prototype);
  }
}

function parseApiErrorBody(data: unknown): ApiErrorBody['error'] | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const body = data as Record<string, unknown>;
  if (body.success !== false || !body.error || typeof body.error !== 'object') {
    return null;
  }
  const err = body.error as Record<string, unknown>;
  const message = typeof err.message === 'string' ? err.message : null;
  const code = typeof err.code === 'string' ? err.code : null;
  if (!message || !code) {
    return null;
  }
  const detailsRaw = err.details;
  let details: ApiErrorBody['error']['details'];
  if (Array.isArray(detailsRaw)) {
    details = detailsRaw
      .map((d) => {
        if (!d || typeof d !== 'object') {
          return null;
        }
        const o = d as Record<string, unknown>;
        const field = typeof o.field === 'string' ? o.field : '';
        const msg = typeof o.message === 'string' ? o.message : '';
        if (!field || !msg) {
          return null;
        }
        return { field, message: msg };
      })
      .filter((x): x is { field: string; message: string } => x !== null);
  }
  return { code, message, details };
}

/** Exported for unit tests. */
export function mapAxiosErrorToCandidateSubmitError(err: unknown): CandidateSubmitError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<unknown>;
    const status = ax.response?.status;
    const parsed = parseApiErrorBody(ax.response?.data);

    if (status === 400 && parsed) {
      const fieldErrors: Partial<Record<string, string>> = {};
      if (parsed.details && parsed.details.length > 0) {
        for (const d of parsed.details) {
          fieldErrors[d.field] = d.message;
        }
      }
      return new CandidateSubmitError({
        kind: 'validation',
        message: parsed.message || 'One or more fields are invalid.',
        fieldErrors,
      });
    }

    if (status === 413) {
      return new CandidateSubmitError({
        kind: 'client',
        message: parsed?.message || 'File exceeds maximum allowed size.',
      });
    }

    if (status === 415) {
      return new CandidateSubmitError({
        kind: 'client',
        message: parsed?.message || 'Only PDF and DOCX files are supported.',
      });
    }

    if (status === 403) {
      return new CandidateSubmitError({
        kind: 'client',
        message: 'You do not have permission to perform this action. Check recruiter authentication.',
      });
    }

    if (status && status >= 500) {
      return new CandidateSubmitError({
        kind: 'server',
        message: 'Something went wrong on our side. Please try again in a moment.',
      });
    }

    if (ax.code === 'ERR_NETWORK' || !ax.response) {
      return new CandidateSubmitError({
        kind: 'server',
        message: 'Unable to reach the server. Check your connection and try again.',
      });
    }

    return new CandidateSubmitError({
      kind: 'client',
      message: 'The request could not be completed. Please try again.',
    });
  }

  return new CandidateSubmitError({
    kind: 'server',
    message: 'An unexpected error occurred. Please try again.',
  });
}

function buildFormData(data: CreateCandidateFormData, cvFile?: File | null): FormData {
  const fd = new FormData();
  fd.append('firstName', data.firstName.trim());
  fd.append('lastName', data.lastName.trim());
  fd.append('email', data.email.trim());
  const phone = data.phone.trim();
  if (phone) {
    fd.append('phone', phone);
  }
  const address = data.address.trim();
  if (address) {
    fd.append('address', address);
  }
  const education = data.education.trim();
  if (education) {
    fd.append('education', education);
  }
  const workExperience = data.workExperience.trim();
  if (workExperience) {
    fd.append('workExperience', workExperience);
  }
  if (cvFile) {
    fd.append('cvFile', cvFile, cvFile.name);
  }
  return fd;
}

export async function createCandidate(
  data: CreateCandidateFormData,
  cvFile?: File | null,
): Promise<CreateCandidateResponse> {
  const fd = buildFormData(data, cvFile);
  try {
    const res = await axios.post<CreateCandidateResponse>(`${getApiBaseUrl()}/api/candidates`, fd, {
      headers: {
        ...getRecruiterAuthHeaders(),
      },
    });
    return res.data;
  } catch (e) {
    throw mapAxiosErrorToCandidateSubmitError(e);
  }
}
