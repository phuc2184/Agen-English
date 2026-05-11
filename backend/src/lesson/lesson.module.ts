import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [LessonService, PrismaService],
  controllers: [LessonController],
})
export class LessonModule {}
