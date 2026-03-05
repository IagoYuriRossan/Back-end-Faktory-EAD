import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto';
import { CurrentUser } from '../common/decorators';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post(':quizId/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzesService.submit(quizId, user.userId, user.organizationId, dto);
  }
}
