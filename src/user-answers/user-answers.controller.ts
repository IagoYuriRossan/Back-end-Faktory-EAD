import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserAnswersService } from './user-answers.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class UserAnswersController {
  constructor(private readonly userAnswersService: UserAnswersService) {}

  @Post()
  submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitAnswerDto) {
    return this.userAnswersService.submit(user, dto);
  }

  @Get('questionnaire/:questionnaireId')
  findByQuestionnaire(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
  ) {
    return this.userAnswersService.findByQuestionnaire(user, questionnaireId);
  }
}
