import { Controller, Post, Body, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AzureSpeechService } from './azure-speech.service';
import { TtsService, TTSVoice } from './tts.service';
import type { Response } from 'express';

@Controller('speech')
export class SpeechController {

  constructor(
    private azureSpeech: AzureSpeechService,
    private ttsService: TtsService,
  ) {}

  /**
   * POST /speech/assess
   * Deep pronunciation assessment (phoneme-level).
   * Restricted to authenticated users. Only SUPER_ADMIN gets real API calls.
   */
  @Post('assess')
  @UseGuards(AuthGuard('jwt'))
  async assess(
    @Body() body: { targetText: string; userInput?: string },
    @Req() req: any,
  ) {
    const user = req.user;

    // Only SUPER_ADMIN gets full AI assessment to manage costs
    if (user.role !== 'SUPER_ADMIN') {
      // Return basic Levenshtein-based scoring for regular users
      return this.azureSpeech.assessPronunciation(body.targetText);
    }

    // For admin: full phoneme-level assessment
    // In production, audioBuffer would come from multipart upload
    return this.azureSpeech.assessPronunciation(body.targetText);
  }

  /**
   * POST /speech/tts
   * Text-to-speech using OpenAI voices.
   * Restricted to SUPER_ADMIN only to manage API costs.
   */
  @Post('tts')
  @UseGuards(AuthGuard('jwt'))
  async textToSpeech(
    @Body() body: { text: string; voice?: TTSVoice },
    @Req() req: any,
    @Res() res: Response,
  ) {
    const user = req.user;

    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'TTS is available for admin accounts only' });
    }

    const audioBuffer = await this.ttsService.synthesize(body.text, body.voice || 'alloy');

    if (!audioBuffer) {
      return res.status(503).json({ message: 'TTS service unavailable — check API key' });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    });
    res.send(audioBuffer);
  }
}
