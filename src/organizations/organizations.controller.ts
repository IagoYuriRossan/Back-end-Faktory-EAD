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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserRole.PLATFORM_ADMIN)
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get()
  @Roles(UserRole.PLATFORM_ADMIN)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.PLATFORM_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.PLATFORM_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.remove(id);
  }
}
