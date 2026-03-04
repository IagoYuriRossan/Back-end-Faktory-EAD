import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserProgressService } from './user-progress.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Put()
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertProgressDto) {
    return this.userProgressService.upsert(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.userProgressService.findAll(user);
  }

  @Get(':lessonId')
  findByLesson(
    @CurrentUser() user: JwtPayload,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.userProgressService.findByLesson(user, lessonId);
  }
}
