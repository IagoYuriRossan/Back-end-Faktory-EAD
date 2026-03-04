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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('modules/:moduleId/lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  create(
    @CurrentUser() user: JwtPayload,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create(user, moduleId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ) {
    return this.lessonsService.findAll(user, moduleId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.lessonsService.findOne(user, moduleId, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(user, moduleId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.lessonsService.remove(user, moduleId, id);
  }
}
