import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpeechModule } from './speech/speech.module';
import { GamificationModule } from './gamification/gamification.module';
import { LessonModule } from './lesson/lesson.module';
import { VocabModule } from './vocab/vocab.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SpeechModule,
    GamificationModule,
    LessonModule,
    VocabModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
