import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GamificationService } from '../gamification/gamification.service';

/** Levenshtein distance between two strings */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const PASS_THRESHOLD = 85;

@Injectable()
export class SpeechScoringService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService
  ) {}

  scorePronunciation(target: string, userInput: string) {
    const targetNorm = normalize(target);
    const inputNorm = normalize(userInput);

    // Sentence-level Levenshtein (fluency)
    const dist = levenshteinDistance(targetNorm, inputNorm);
    const maxLen = Math.max(targetNorm.length, inputNorm.length, 1);
    const fluencyScore = Math.round(((maxLen - dist) / maxLen) * 100);

    // Word-level matching (pronunciation)
    const targetWords = targetNorm.split(' ');
    const inputWords = inputNorm.split(' ');
    let correctCount = 0;

    for (let i = 0; i < targetWords.length; i++) {
      const expected = targetWords[i];
      const spoken = inputWords[i] || '';
      const wordDist = levenshteinDistance(expected, spoken);
      const isCorrect = wordDist === 0 || (expected.length > 3 && wordDist <= 1);
      if (isCorrect) correctCount++;
    }

    const wordMatchRate = targetWords.length > 0 ? correctCount / targetWords.length : 0;
    const pronunciationScore = Math.round(wordMatchRate * 100);
    const overallScore = Math.round(pronunciationScore * 0.6 + fluencyScore * 0.4);

    return {
      pronunciationScore,
      fluencyScore,
      overallScore,
      passed: overallScore >= PASS_THRESHOLD,
    };
  }

  async saveSession(userId: string, target: string, userInput: string) {
    const scores = this.scorePronunciation(target, userInput);

    const session = await this.prisma.speakingSession.create({
      data: {
        userId,
        target_sentence: target,
        user_input: userInput,
        pronunciation_score: scores.pronunciationScore,
        fluency_score: scores.fluencyScore,
      },
    });

    if (scores.passed) {
      await this.gamificationService.addXp(userId, 20); // Award 20 XP for passing
    }

    return session;
  }
}
