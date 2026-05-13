import { Module } from '@nestjs/common';
import { SpeechController } from './speech.controller';
import { AzureSpeechService } from './azure-speech.service';
import { SpeechScoringService } from './speech-scoring.service';
import { TtsService } from './tts.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  controllers: [SpeechController],
  providers: [AzureSpeechService, SpeechScoringService, TtsService, PrismaService],
})
export class SpeechModule {}
