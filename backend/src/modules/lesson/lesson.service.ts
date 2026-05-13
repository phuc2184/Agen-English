import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lesson.findMany();
  }

  async findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }
}
