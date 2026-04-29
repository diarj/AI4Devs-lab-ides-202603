import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import { ForbiddenError } from '../errors/ForbiddenError';
import {
  createCandidateForRecruiter,
  type CandidateServiceDeps,
} from './candidateService';
import { LocalDocumentStorageService } from '../../infrastructure/storage/documentStorageService';

function buildPrismaMock(): Pick<
  PrismaClient,
  'user' | 'candidate' | 'candidateDocument'
> {
  return {
    user: { findUnique: jest.fn() } as unknown as PrismaClient['user'],
    candidate: { create: jest.fn(), delete: jest.fn() } as unknown as PrismaClient['candidate'],
    candidateDocument: { create: jest.fn(), findFirst: jest.fn() } as unknown as PrismaClient['candidateDocument'],
  };
}

describe('createCandidateForRecruiter', () => {
  const actor = { id: 1, role: 'recruiter' as const };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when recruiter user does not exist', async () => {
    const prismaMock = buildPrismaMock();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const storage = new LocalDocumentStorageService(require('os').tmpdir());

    const deps: CandidateServiceDeps = {
      prismaClient: prismaMock as unknown as PrismaClient,
      storage,
    };

    await expect(
      createCandidateForRecruiter({ firstName: 'A', lastName: 'B', email: 'a@b.com' }, actor, undefined, deps),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('should create candidate without CV', async () => {
    const prismaMock = buildPrismaMock();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'r@x.com', name: null });
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

    const storage = new LocalDocumentStorageService(require('os').tmpdir());
    const deps: CandidateServiceDeps = {
      prismaClient: prismaMock as unknown as PrismaClient,
      storage,
    };

    const result = await createCandidateForRecruiter(
      { firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' },
      actor,
      undefined,
      deps,
    );

    expect(result.id).toBe('cand-1');
    expect(result.cv).toBeNull();
    expect(prismaMock.candidateDocument.create).not.toHaveBeenCalled();
  });

  it('should roll back candidate when CV upload fails', async () => {
    const prismaMock = buildPrismaMock();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'r@x.com', name: null });
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

    const storage = new LocalDocumentStorageService(require('os').tmpdir());
    jest.spyOn(storage, 'uploadCv').mockRejectedValue(new Error('disk full'));

    const deps: CandidateServiceDeps = {
      prismaClient: prismaMock as unknown as PrismaClient,
      storage,
    };

    const file = {
      buffer: Buffer.from('%PDF'),
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      size: 4,
    } as Express.Multer.File;

    await expect(
      createCandidateForRecruiter({ firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' }, actor, file, deps),
    ).rejects.toThrow('disk full');

    expect(prismaMock.candidate.delete).toHaveBeenCalledWith({ where: { id: 'cand-1' } });
  });
});
