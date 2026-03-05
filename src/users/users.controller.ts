import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { TenantInterceptor } from '../common/interceptors';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('users')
@UseInterceptors(TenantInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.usersService.findAllByOrganization(
      user.organizationId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.remove(id, user.organizationId);
  }
}
