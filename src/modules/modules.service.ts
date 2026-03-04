import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyCourseAccess(
    courseId: string,
    organizationId: string,
    role: UserRole,
  ) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { organizationId },
          ...(role === UserRole.PLATFORM_ADMIN
            ? [{ isGlobal: true, organizationId: null }]
            : []),
        ],
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }

    return course;
  }

  async create(user: JwtPayload, courseId: string, dto: CreateModuleDto) {
    await this.verifyCourseAccess(courseId, user.organizationId, user.role);
    return this.prisma.module.create({ data: { ...dto, courseId } });
  }

  async findAll(user: JwtPayload, courseId: string) {
    await this.verifyCourseAccess(courseId, user.organizationId, user.role);
    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findOne(user: JwtPayload, courseId: string, id: string) {
    await this.verifyCourseAccess(courseId, user.organizationId, user.role);
    const module = await this.prisma.module.findFirst({
      where: { id, courseId },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado.');
    }

    return module;
  }

  async update(
    user: JwtPayload,
    courseId: string,
    id: string,
    dto: UpdateModuleDto,
  ) {
    await this.findOne(user, courseId, id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }

  async remove(user: JwtPayload, courseId: string, id: string) {
    await this.findOne(user, courseId, id);
    return this.prisma.module.delete({ where: { id } });
  }
}
