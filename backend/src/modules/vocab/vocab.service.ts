import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VocabService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.vocab.findMany({
      where: { userId },
      orderBy: { nextReview: 'asc' },
    });
  }

  async getDue(userId: string) {
    return this.prisma.vocab.findMany({
      where: {
        userId,
        nextReview: { lte: new Date() },
      },
    });
  }
}
