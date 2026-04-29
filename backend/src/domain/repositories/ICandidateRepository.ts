import type { Candidate as PrismaCandidate } from '@prisma/client';
import type { CreateCandidateInput } from '../../application/dto/createCandidateInput';

export interface ICandidateRepository {
  create(input: CreateCandidateInput & { createdByUserId: number }): Promise<PrismaCandidate>;
  deleteById(id: string): Promise<void>;
}
