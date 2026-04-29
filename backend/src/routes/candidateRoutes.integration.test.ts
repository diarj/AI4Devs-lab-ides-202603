import request from 'supertest';
import path from 'path';
import os from 'os';
import type { PrismaClient } from '@prisma/client';
import { createApp } from '../app';
import { prisma } from '../infrastructure/prismaClient';

jest.mock('../infrastructure/prismaClient', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    candidate: { create: jest.fn(), delete: jest.fn() },
    candidateDocument: { create: jest.fn(), findFirst: jest.fn() },
  },
}));

describe('candidateRoutes integration', () => {
  const app = createApp();
  const prismaMock = prisma as unknown as jest.Mocked<
    Pick<PrismaClient, 'user' | 'candidate' | 'candidateDocument'>
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CV_STORAGE_PATH = path.join(os.tmpdir(), `lti-cv-integration-${Date.now()}`);
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'r@test.com', name: null });
    const createdAt = new Date('2026-04-28T21:00:00.000Z');
    (prismaMock.candidate.create as jest.Mock).mockResolvedValue({
      id: 'cand-1',
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      phone: null,
      address: null,
      education: null,
      workExperience: null,
      createdByUserId: 1,
      createdAt,
      updatedAt: createdAt,
    });
    (prismaMock.candidateDocument.findFirst as jest.Mock).mockResolvedValue(null);
  });

  it('should return 403 when recruiter headers are missing', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'Lopez')
      .field('email', 'ana@example.com');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('x-user-id', '1')
      .set('x-user-role', 'recruiter')
      .field('firstName', '')
      .field('lastName', 'Lopez')
      .field('email', 'bad');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('should return 201 when candidate is created without CV', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('x-user-id', '1')
      .set('x-user-role', 'recruiter')
      .field('firstName', 'Ana')
      .field('lastName', 'Lopez')
      .field('email', 'ana@example.com');

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('cand-1');
    expect(res.body.cv).toBeNull();
    expect(prismaMock.candidateDocument.create).not.toHaveBeenCalled();
  });

  it('should return 201 when candidate is created with PDF CV', async () => {
    (prismaMock.candidateDocument.findFirst as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      candidateId: 'cand-1',
      documentType: 'CV',
      fileName: 'cv.pdf',
      mimeType: 'application/pdf',
      fileSize: 4,
      storageKey: 'candidates/cand-1/x.pdf',
      uploadedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/candidates')
      .set('x-user-id', '1')
      .set('x-user-role', 'recruiter')
      .field('firstName', 'Ana')
      .field('lastName', 'Lopez')
      .field('email', 'ana@example.com')
      .attach('cvFile', Buffer.from('%PDF-'), 'cv.pdf');

    expect(res.status).toBe(201);
    expect(res.body.cv).not.toBeNull();
    expect(res.body.cv.url).toContain('/api/candidates/cand-1/cv');
    expect(prismaMock.candidateDocument.create).toHaveBeenCalled();
  });

  it('should return 415 for unsupported file types', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('x-user-id', '1')
      .set('x-user-role', 'recruiter')
      .field('firstName', 'Ana')
      .field('lastName', 'Lopez')
      .field('email', 'ana@example.com')
      .attach('cvFile', Buffer.from('hello'), 'notes.exe');

    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('should return 413 when file exceeds limit', async () => {
    const previous = process.env.CV_MAX_UPLOAD_BYTES;
    process.env.CV_MAX_UPLOAD_BYTES = '64';

    const big = Buffer.alloc(128, 'x');
    const res = await request(app)
      .post('/api/candidates')
      .set('x-user-id', '1')
      .set('x-user-role', 'recruiter')
      .field('firstName', 'Ana')
      .field('lastName', 'Lopez')
      .field('email', 'ana@example.com')
      .attach('cvFile', big, 'cv.pdf');

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');

    if (previous === undefined) {
      delete process.env.CV_MAX_UPLOAD_BYTES;
    } else {
      process.env.CV_MAX_UPLOAD_BYTES = previous;
    }
  });
});
