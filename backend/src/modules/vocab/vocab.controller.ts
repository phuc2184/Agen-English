import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { VocabService } from './vocab.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('vocabulary')
export class VocabController {
  constructor(private readonly vocabService: VocabService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: any) {
    return this.vocabService.findAll(req.user.id);
  }

  @Get('due')
  @UseGuards(AuthGuard('jwt'))
  async getDue(@Req() req: any) {
    return this.vocabService.getDue(req.user.id);
  }
}
