import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SM2Service } from '../../common/services/sm2.service';

@Injectable()
export class SpacedRepetitionService {
  constructor(private prisma: PrismaService) {}

  async calculateNextReview(vocabId: string, quality: number) {
    // Quality: 0-5 (0=Blackout, 1=Wrong, 2=Wrong-easy, 3=Hard, 4=Good, 5=Easy)
    const vocab = await this.prisma.vocab.findUnique({ where: { id: vocabId } });
    if (!vocab) throw new Error('Vocab not found');

    const result = SM2Service.calculate(
      quality,
      vocab.sm2_repetitions,
      vocab.sm2_easiness,
      vocab.sm2_interval
    );

    return this.prisma.vocab.update({
      where: { id: vocabId },
      data: {
        sm2_repetitions: result.repetitions,
        sm2_easiness: result.easiness,
        sm2_interval: result.interval,
        nextReview: result.nextReview,
      },
    });
  }

  async getDueCards(userId: string) {
    const now = new Date();
    return this.prisma.vocab.findMany({
      where: {
        userId,
        nextReview: {
          lte: now,
        },
      },
      orderBy: {
        nextReview: 'asc'
      }
    });
  }
}
