import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SpacedRepetitionService {
  constructor(private prisma: PrismaService) {}

  async calculateNextReview(vocabId: string, quality: number) {
    // Quality: 0-5 (0=Blackout, 1=Wrong, 2=Wrong-easy, 3=Hard, 4=Good, 5=Easy)
    const vocab = await this.prisma.vocab.findUnique({ where: { id: vocabId } });
    if (!vocab) throw new Error('Vocab not found');

    let { sm2_repetitions, sm2_easiness, sm2_interval } = vocab;

    if (quality >= 3) {
      if (sm2_repetitions === 0) {
        sm2_interval = 1;
      } else if (sm2_repetitions === 1) {
        sm2_interval = 6;
      } else {
        sm2_interval = Math.round(sm2_interval * sm2_easiness);
      }
      sm2_repetitions++;
    } else {
      sm2_repetitions = 0;
      sm2_interval = 1;
    }

    sm2_easiness = sm2_easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (sm2_easiness < 1.3) {
      sm2_easiness = 1.3;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + sm2_interval);

    return this.prisma.vocab.update({
      where: { id: vocabId },
      data: {
        sm2_repetitions,
        sm2_easiness,
        sm2_interval,
        nextReview,
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
