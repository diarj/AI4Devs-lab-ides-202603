import type { Prisma, PrismaClient } from '@prisma/client';
import type { CreateCandidateInput } from '../../application/dto/createCandidateInput';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';

type DbClient = PrismaClient | Prisma.TransactionClient;

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateCandidateInput & { createdByUserId: number }) {
    return this.db.candidate.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        education: input.education,
        workExperience: input.workExperience,
        createdByUserId: input.createdByUserId,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.candidate.delete({ where: { id } });
  }
}
