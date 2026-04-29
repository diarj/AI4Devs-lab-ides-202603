import type { Prisma, PrismaClient } from '@prisma/client';
import type {
  CandidateDocumentCreateInput,
  ICandidateDocumentRepository,
} from '../../domain/repositories/ICandidateDocumentRepository';

type DbClient = PrismaClient | Prisma.TransactionClient;

export class PrismaCandidateDocumentRepository implements ICandidateDocumentRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CandidateDocumentCreateInput) {
    return this.db.candidateDocument.create({
      data: {
        candidateId: input.candidateId,
        documentType: 'CV',
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
      },
    });
  }

  async findCvByCandidateId(candidateId: string) {
    return this.db.candidateDocument.findFirst({
      where: { candidateId, documentType: 'CV' },
    });
  }
}
