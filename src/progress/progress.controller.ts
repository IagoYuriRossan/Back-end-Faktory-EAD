import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../common/decorators';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('me')
  getMyProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getMyProgress(user.userId, user.organizationId);
  }

  @Get('course/:courseId')
  getCourseProgress(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.getCourseProgress(
      user.userId,
      user.organizationId,
      courseId,
    );
  }

  @Post('lesson/:lessonId/complete')
  @HttpCode(HttpStatus.OK)
  completeLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.completeLesson(
      user.userId,
      user.organizationId,
      lessonId,
    );
  }
}
