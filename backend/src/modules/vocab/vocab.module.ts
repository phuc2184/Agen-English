import { Module } from '@nestjs/common';
import { VocabService } from './vocab.service';
import { VocabController } from './vocab.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  providers: [VocabService, PrismaService],
  controllers: [VocabController],
})
export class VocabModule {}
