/**
 * ScoringEngine — Levenshtein-based pronunciation & fluency scoring.
 * Shared scoring logic: can be imported in both backend service and frontend utils.
 */

/** Levenshtein distance between two strings */
export function levenshteinDistance(a: string, b: string): number {
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

/** Normalize a sentence for comparison: lowercase, strip punctuation, collapse spaces */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Word-level diff result */
export interface WordResult {
  word: string;
  correct: boolean;
  expected: string;
}

/** Full scoring result */
export interface ScoringResult {
  pronunciationScore: number;  // 0-100
  fluencyScore: number;        // 0-100
  overallScore: number;        // 0-100
  passed: boolean;             // overallScore >= THRESHOLD
  wordResults: WordResult[];
  debugLog: {
    targetNormalized: string;
    inputNormalized: string;
    levenshteinDistance: number;
    maxLen: number;
    wordMatchRate: number;
  };
}

const PASS_THRESHOLD = 85;

/**
 * Score user input against a target sentence.
 * pronunciationScore: based on word-level matching accuracy.
 * fluencyScore: based on overall Levenshtein similarity of the full sentence.
 */
export function scorePronunciation(target: string, userInput: string): ScoringResult {
  const targetNorm = normalize(target);
  const inputNorm = normalize(userInput);

  // ── Sentence-level Levenshtein (fluency) ──
  const dist = levenshteinDistance(targetNorm, inputNorm);
  const maxLen = Math.max(targetNorm.length, inputNorm.length, 1);
  const fluencyScore = Math.round(((maxLen - dist) / maxLen) * 100);

  // ── Word-level matching (pronunciation) ──
  const targetWords = targetNorm.split(' ');
  const inputWords = inputNorm.split(' ');

  const wordResults: WordResult[] = [];
  let correctCount = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const expected = targetWords[i];
    const spoken = inputWords[i] || '';

    // Allow minor typo: Levenshtein <= 1 for words > 3 chars
    const wordDist = levenshteinDistance(expected, spoken);
    const isCorrect = wordDist === 0 || (expected.length > 3 && wordDist <= 1);

    if (isCorrect) correctCount++;

    wordResults.push({
      word: spoken || '—',
      correct: isCorrect,
      expected,
    });
  }

  // Extra words spoken (penalize slightly but still show them)
  for (let i = targetWords.length; i < inputWords.length; i++) {
    wordResults.push({
      word: inputWords[i],
      correct: false,
      expected: '',
    });
  }

  const wordMatchRate = targetWords.length > 0 ? correctCount / targetWords.length : 0;
  const pronunciationScore = Math.round(wordMatchRate * 100);

  const overallScore = Math.round(pronunciationScore * 0.6 + fluencyScore * 0.4);

  return {
    pronunciationScore,
    fluencyScore,
    overallScore,
    passed: overallScore >= PASS_THRESHOLD,
    wordResults,
    debugLog: {
      targetNormalized: targetNorm,
      inputNormalized: inputNorm,
      levenshteinDistance: dist,
      maxLen,
      wordMatchRate,
    },
  };
}
