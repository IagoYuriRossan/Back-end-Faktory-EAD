import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { TenantInterceptor } from '../common/interceptors';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('courses')
@UseInterceptors(TenantInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.create(dto, user.userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.coursesService.findAllForOrganization(
      user.organizationId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.findOne(id, user.organizationId);
  }

  @Get(':courseId/modules')
  findModules(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.findModulesByCourse(courseId, user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.update(id, user.organizationId, dto);
  }
}
