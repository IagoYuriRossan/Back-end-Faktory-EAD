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
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@Controller('questionnaires')
@UseGuards(JwtAuthGuard)
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.questionnairesService.findAll(user);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionnairesService.findOne(user, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionnaireDto,
  ) {
    return this.questionnairesService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionnairesService.remove(user, id);
  }
}
