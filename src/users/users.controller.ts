import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.remove(user.organizationId, id);
  }
}
