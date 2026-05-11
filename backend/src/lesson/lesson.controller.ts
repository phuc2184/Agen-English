import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }
}
