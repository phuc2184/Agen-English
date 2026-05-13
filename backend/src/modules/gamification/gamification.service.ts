import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async addXp(userId: string, amount: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        total_xp: { increment: amount },
      },
    });

    // Simple level up logic: every 1000 XP is a level
    const newLevel = Math.floor(user.total_xp / 1000) + 1;
    if (newLevel > user.current_level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { current_level: newLevel },
      });
    }

    await this.checkAchievements(userId);
    return user;
  }

  async checkAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { badges: true, vocabs: true },
    });

    if (!user) return;

    const existingBadgeNames = user.badges.map((b) => b.name);

    // 1. "Chiến binh 7 ngày" (7-day streak)
    if (user.streak_count >= 7 && !existingBadgeNames.includes('7-Day Warrior')) {
      await this.prisma.badge.create({
        data: {
          userId,
          name: '7-Day Warrior',
          description: 'Maintaining a 7-day learning streak.',
          icon: '🔥',
        },
      });
    }

    // 2. "Thánh từ vựng" (100 vocabs)
    if (user.vocabs.length >= 100 && !existingBadgeNames.includes('Vocabulary Saint')) {
      await this.prisma.badge.create({
        data: {
          userId,
          name: 'Vocabulary Saint',
          description: 'Learned over 100 vocabulary words.',
          icon: '📚',
        },
      });
    }
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      take: 10,
      orderBy: { total_xp: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        total_xp: true,
        current_level: true,
        role: true,
        badges: true,
      },
    });
  }
}
