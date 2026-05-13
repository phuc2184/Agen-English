import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SpeechModule } from './modules/speech/speech.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { VocabModule } from './modules/vocab/vocab.module';

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
