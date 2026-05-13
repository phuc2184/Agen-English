export interface SM2Result {
  repetitions: number;
  easiness: number;
  interval: number;
  nextReview: Date;
}

export class SM2Service {
  /**
   * Calculate next SM-2 parameters
   * @param quality Quality: 0-5 (0=Blackout, 1=Wrong, 2=Wrong-easy, 3=Hard, 4=Good, 5=Easy)
   * @param repetitions Previous repetitions
   * @param easiness Previous easiness factor
   * @param interval Previous interval (in days)
   */
  static calculate(
    quality: number,
    repetitions: number,
    easiness: number,
    interval: number
  ): SM2Result {
    let nextRepetitions = repetitions;
    let nextEasiness = easiness;
    let nextInterval = interval;

    if (quality >= 3) {
      if (nextRepetitions === 0) {
        nextInterval = 1;
      } else if (nextRepetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(nextInterval * nextEasiness);
      }
      nextRepetitions++;
    } else {
      nextRepetitions = 0;
      nextInterval = 1;
    }

    nextEasiness = nextEasiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEasiness < 1.3) {
      nextEasiness = 1.3;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    return {
      repetitions: nextRepetitions,
      easiness: nextEasiness,
      interval: nextInterval,
      nextReview,
    };
  }
}
