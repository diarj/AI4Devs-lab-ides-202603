jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    isAxiosError: (v: unknown) =>
      typeof v === 'object' &&
      v !== null &&
      (v as { isAxiosError?: boolean }).isAxiosError === true,
  },
}));

import axios from 'axios';
import {
  CandidateSubmitError,
  createCandidate,
  mapAxiosErrorToCandidateSubmitError,
} from '../services/candidateService';
import type { CreateCandidateFormData } from '../components/candidates/candidateFormTypes';

const mockedAxios = axios as jest.Mocked<typeof axios> & {
  post: jest.Mock;
  isAxiosError: (v: unknown) => boolean;
};

function fakeAxiosError(payload: {
  status?: number;
  data?: unknown;
  code?: string;
}): unknown {
  return {
    isAxiosError: true,
    message: 'Request failed',
    name: 'AxiosError',
    config: {},
    response: payload.status
      ? {
          status: payload.status,
          data: payload.data,
        }
      : undefined,
    code: payload.code,
  };
}

describe('mapAxiosErrorToCandidateSubmitError', () => {
  it('maps 400 with field details to validation', () => {
    const err = fakeAxiosError({
      status: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more fields are invalid.',
          details: [{ field: 'email', message: 'Invalid email format.' }],
        },
      },
    });
    const mapped = mapAxiosErrorToCandidateSubmitError(err);
    expect(mapped).toBeInstanceOf(CandidateSubmitError);
    expect(mapped.kind).toBe('validation');
    expect(mapped.fieldErrors.email).toBe('Invalid email format.');
  });

  it('maps 413 to client message', () => {
    const err = fakeAxiosError({
      status: 413,
      data: {
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'File exceeds maximum allowed size.' },
      },
    });
    const mapped = mapAxiosErrorToCandidateSubmitError(err);
    expect(mapped.kind).toBe('client');
    expect(mapped.message).toMatch(/exceeds maximum/i);
  });

  it('maps 415 to client message', () => {
    const err = fakeAxiosError({
      status: 415,
      data: {
        success: false,
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Only PDF and DOCX files are allowed.' },
      },
    });
    const mapped = mapAxiosErrorToCandidateSubmitError(err);
    expect(mapped.kind).toBe('client');
    expect(mapped.message).toMatch(/pdf|docx/i);
  });

  it('maps network failure to server-side user message', () => {
    const err = fakeAxiosError({ code: 'ERR_NETWORK' });
    const mapped = mapAxiosErrorToCandidateSubmitError(err);
    expect(mapped.kind).toBe('server');
    expect(mapped.message).toMatch(/reach the server|connection/i);
  });
});

describe('createCandidate', () => {
  const minimal: CreateCandidateFormData = {
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana@example.com',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
  };

  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it('posts multipart payload to /api/candidates', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        id: 'cand-1',
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        phone: null,
        address: null,
        education: null,
        workExperience: null,
        cv: null,
        createdAt: '2026-04-28T21:00:00.000Z',
      },
    });

    const result = await createCandidate(minimal, null);
    expect(result.id).toBe('cand-1');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [url] = mockedAxios.post.mock.calls[0];
    expect(String(url)).toContain('/api/candidates');
  });

  it('throws CandidateSubmitError on API failure', async () => {
    mockedAxios.post.mockRejectedValue(
      fakeAxiosError({
        status: 500,
        data: {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' },
        },
      }),
    );

    await expect(createCandidate(minimal, null)).rejects.toBeInstanceOf(CandidateSubmitError);
  });
});
