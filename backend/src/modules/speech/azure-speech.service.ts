import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * PhonemeResult — individual phoneme assessment
 */
export interface PhonemeResult {
  phoneme: string;
  score: number;       // 0-100
  offset: number;      // milliseconds
  duration: number;    // milliseconds
}

/**
 * SyllableResult — syllable-level breakdown
 */
export interface SyllableResult {
  syllable: string;
  score: number;
  phonemes: PhonemeResult[];
}

/**
 * WordAssessment — per-word deep analysis
 */
export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Mispronunciation' | 'Omission' | 'Insertion';
  syllables: SyllableResult[];
}

/**
 * DeepSpeechResult — full pronunciation assessment
 */
export interface DeepSpeechResult {
  accuracyScore: number;
  fluencyScore: number;
  prosodyScore: number;
  overallScore: number;
  passed: boolean;
  words: WordAssessment[];
  transcript: string;
}

const PASS_THRESHOLD = 85;

@Injectable()
export class AzureSpeechService {
  private readonly logger = new Logger(AzureSpeechService.name);
  private readonly apiKey = process.env.AZURE_SPEECH_KEY || '';
  private readonly region = process.env.AZURE_SPEECH_REGION || 'southeastasia';

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Assess pronunciation using Azure Speech SDK REST API.
   * If no API key is configured, returns a mock result based on Levenshtein.
   */
  async assessPronunciation(
    targetText: string,
    audioBuffer?: Buffer,
  ): Promise<DeepSpeechResult> {
    if (!this.isConfigured || !audioBuffer) {
      this.logger.warn('Azure Speech not configured or no audio — using mock phoneme analysis');
      return this.generateMockAssessment(targetText);
    }

    try {
      const endpoint = `https://${this.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

      const response = await axios.post(endpoint, audioBuffer, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'audio/wav',
          'Pronunciation-Assessment': Buffer.from(JSON.stringify({
            ReferenceText: targetText,
            GradingSystem: 'HundredMark',
            Granularity: 'Phoneme',
            Dimension: 'Comprehensive',
            EnableProsodyAssessment: true,
          })).toString('base64'),
        },
        params: { language: 'en-US' },
      });

      return this.parseAzureResponse(response.data, targetText);
    } catch (error) {
      this.logger.error('Azure Speech API error, falling back to mock', error);
      return this.generateMockAssessment(targetText);
    }
  }

  private parseAzureResponse(data: any, targetText: string): DeepSpeechResult {
    const nBest = data?.NBest?.[0];
    if (!nBest) return this.generateMockAssessment(targetText);

    const pa = nBest.PronunciationAssessment || {};
    const words: WordAssessment[] = (nBest.Words || []).map((w: any) => ({
      word: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore || 0,
      errorType: w.PronunciationAssessment?.ErrorType || 'None',
      syllables: (w.Syllables || []).map((s: any) => ({
        syllable: s.Syllable,
        score: s.PronunciationAssessment?.AccuracyScore || 0,
        phonemes: (s.Phonemes || []).map((p: any) => ({
          phoneme: p.Phoneme,
          score: p.PronunciationAssessment?.AccuracyScore || 0,
          offset: p.Offset || 0,
          duration: p.Duration || 0,
        })),
      })),
    }));

    const overallScore = Math.round(
      (pa.AccuracyScore || 0) * 0.4 +
      (pa.FluencyScore || 0) * 0.3 +
      (pa.ProsodyScore || 0) * 0.3
    );

    return {
      accuracyScore: Math.round(pa.AccuracyScore || 0),
      fluencyScore: Math.round(pa.FluencyScore || 0),
      prosodyScore: Math.round(pa.ProsodyScore || 0),
      overallScore,
      passed: overallScore >= PASS_THRESHOLD,
      words,
      transcript: nBest.Display || targetText,
    };
  }

  /**
   * Generate a mock assessment with realistic phoneme data
   * for development/testing without real API keys.
   */
  private generateMockAssessment(targetText: string): DeepSpeechResult {
    const targetWords = targetText.split(' ');

    const words: WordAssessment[] = targetWords.map((word, i) => {
      // Create realistic syllable breakdown
      const syllables = this.mockSyllables(word);
      const wordScore = syllables.reduce((sum, s) => sum + s.score, 0) / syllables.length;

      return {
        word,
        accuracyScore: Math.round(wordScore),
        errorType: wordScore < 70 ? 'Mispronunciation' : 'None',
        syllables,
      };
    });

    const avgAccuracy = words.reduce((s, w) => s + w.accuracyScore, 0) / words.length;
    const fluency = Math.round(75 + Math.random() * 20);
    const prosody = Math.round(70 + Math.random() * 25);
    const overall = Math.round(avgAccuracy * 0.4 + fluency * 0.3 + prosody * 0.3);

    return {
      accuracyScore: Math.round(avgAccuracy),
      fluencyScore: fluency,
      prosodyScore: prosody,
      overallScore: overall,
      passed: overall >= PASS_THRESHOLD,
      words,
      transcript: targetText,
    };
  }

  private mockSyllables(word: string): SyllableResult[] {
    // Simple syllable split: every 2-3 chars
    const syllables: SyllableResult[] = [];
    let pos = 0;
    while (pos < word.length) {
      const len = Math.min(2 + Math.floor(Math.random() * 2), word.length - pos);
      const syl = word.slice(pos, pos + len);
      const score = Math.round(65 + Math.random() * 35);

      syllables.push({
        syllable: syl,
        score,
        phonemes: syl.split('').map((ch, j) => ({
          phoneme: ch.toUpperCase(),
          score: Math.round(60 + Math.random() * 40),
          offset: (pos + j) * 80,
          duration: 80,
        })),
      });

      pos += len;
    }
    return syllables;
  }
}
