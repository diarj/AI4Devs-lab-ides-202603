import type { Candidate as PrismaCandidate } from '@prisma/client';
import type { Express } from 'express';
import { validateCreateCandidateInput } from '../validator';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import type { AuthUser } from '../../types/auth';
import { prisma } from '../../infrastructure/prismaClient';
import { PrismaCandidateRepository } from '../../infrastructure/repositories/prismaCandidateRepository';
import { PrismaCandidateDocumentRepository } from '../../infrastructure/repositories/prismaCandidateDocumentRepository';
import {
  createLocalDocumentStorageFromEnv,
  LocalDocumentStorageService,
} from '../../infrastructure/storage/documentStorageService';

export interface CreateCandidateResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: string | null;
  workExperience: string | null;
  cv: {
    fileName: string;
    mimeType: string;
    size: number;
    url: string;
  } | null;
  createdAt: string;
}

export interface CvDownloadDescriptor {
  absolutePath: string;
  mimeType: string;
  fileName: string;
}

function buildCvUrl(candidateId: string): string {
  const base = (process.env.APP_BASE_URL || 'http://localhost:3010').replace(/\/$/, '');
  return `${base}/api/candidates/${candidateId}/cv`;
}

function mapSuccess(candidate: PrismaCandidate, cv: CreateCandidateResult['cv']): CreateCandidateResult {
  return {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    address: candidate.address,
    education: candidate.education,
    workExperience: candidate.workExperience,
    cv,
    createdAt: candidate.createdAt.toISOString(),
  };
}

export interface CandidateServiceDeps {
  prismaClient: typeof prisma;
  storage: LocalDocumentStorageService;
}

export function createCandidateServiceDeps(): CandidateServiceDeps {
  return {
    prismaClient: prisma,
    storage: createLocalDocumentStorageFromEnv(),
  };
}

export async function createCandidateForRecruiter(
  rawBody: Record<string, unknown>,
  actor: AuthUser,
  file: Express.Multer.File | undefined,
  deps: CandidateServiceDeps = createCandidateServiceDeps(),
): Promise<CreateCandidateResult> {
  const input = validateCreateCandidateInput(rawBody);

  const recruiter = await deps.prismaClient.user.findUnique({ where: { id: actor.id } });
  if (!recruiter) {
    throw new ForbiddenError('Recruiter account not found.');
  }

  const candRepo = new PrismaCandidateRepository(deps.prismaClient);
  const docRepo = new PrismaCandidateDocumentRepository(deps.prismaClient);

  const candidateRow = await candRepo.create({
    ...input,
    createdByUserId: actor.id,
  });

  if (!file) {
    return mapSuccess(candidateRow, null);
  }

  let storageKey: string | undefined;
  try {
    const uploaded = await deps.storage.uploadCv({
      candidateId: candidateRow.id,
      buffer: file.buffer,
      originalName: file.originalname,
    });
    storageKey = uploaded.storageKey;
    await docRepo.create({
      candidateId: candidateRow.id,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storageKey: uploaded.storageKey,
    });
  } catch (err) {
    if (storageKey) {
      await deps.storage.deleteByStorageKey(storageKey).catch(() => undefined);
    }
    await candRepo.deleteById(candidateRow.id).catch(() => undefined);
    throw err;
  }

  const docRow = await docRepo.findCvByCandidateId(candidateRow.id);
  const cv = docRow
    ? {
        fileName: docRow.fileName,
        mimeType: docRow.mimeType,
        size: docRow.fileSize,
        url: buildCvUrl(candidateRow.id),
      }
    : null;

  return mapSuccess(candidateRow, cv);
}

export async function getCvDownloadDescriptor(
  candidateId: string,
  deps: CandidateServiceDeps = createCandidateServiceDeps(),
): Promise<CvDownloadDescriptor> {
  const docRepo = new PrismaCandidateDocumentRepository(deps.prismaClient);
  const candidate = await deps.prismaClient.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    throw new NotFoundError('Candidate not found.');
  }

  const doc = await docRepo.findCvByCandidateId(candidateId);
  if (!doc) {
    throw new NotFoundError('CV not found for this candidate.');
  }

  return {
    absolutePath: deps.storage.resolveAbsolutePath(doc.storageKey),
    mimeType: doc.mimeType,
    fileName: doc.fileName,
  };
}
