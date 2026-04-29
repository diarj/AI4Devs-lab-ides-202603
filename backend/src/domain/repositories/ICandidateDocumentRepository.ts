import type { CandidateDocument as PrismaCandidateDocument } from '@prisma/client';

export interface CandidateDocumentCreateInput {
  candidateId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
}

export interface ICandidateDocumentRepository {
  create(input: CandidateDocumentCreateInput): Promise<PrismaCandidateDocument>;
  findCvByCandidateId(candidateId: string): Promise<PrismaCandidateDocument | null>;
}
