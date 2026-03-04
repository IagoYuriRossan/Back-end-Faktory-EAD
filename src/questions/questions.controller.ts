import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questionnaires/:questionnaireId/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  create(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.create(user, questionnaireId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
  ) {
    return this.questionsService.findAll(user, questionnaireId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.findOne(user, questionnaireId, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(user, questionnaireId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.remove(user, questionnaireId, id);
  }
}
