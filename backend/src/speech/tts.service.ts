import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export type TTSVoice = 'alloy' | 'echo' | 'shimmer';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY || '';

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Generate speech audio from text using OpenAI TTS.
   * Returns a Buffer of MP3 audio data.
   * Falls back to null if API key is not configured.
   */
  async synthesize(text: string, voice: TTSVoice = 'alloy'): Promise<Buffer | null> {
    if (!this.isConfigured) {
      this.logger.warn('OpenAI API key not configured — TTS unavailable');
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1-hd',
          voice,
          input: text,
          response_format: 'mp3',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        },
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('OpenAI TTS API error', error);
      return null;
    }
  }
}
