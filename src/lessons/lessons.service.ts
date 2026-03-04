import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyModuleAccess(
    moduleId: string,
    organizationId: string,
    role: UserRole,
  ) {
    const module = await this.prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          OR: [
            { organizationId },
            ...(role === UserRole.PLATFORM_ADMIN
              ? [{ isGlobal: true, organizationId: null }]
              : []),
          ],
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado.');
    }

    return module;
  }

  async create(user: JwtPayload, moduleId: string, dto: CreateLessonDto) {
    await this.verifyModuleAccess(moduleId, user.organizationId, user.role);
    return this.prisma.lesson.create({ data: { ...dto, moduleId } });
  }

  async findAll(user: JwtPayload, moduleId: string) {
    await this.verifyModuleAccess(moduleId, user.organizationId, user.role);
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(user: JwtPayload, moduleId: string, id: string) {
    await this.verifyModuleAccess(moduleId, user.organizationId, user.role);
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, moduleId },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada.');
    }

    return lesson;
  }

  async update(
    user: JwtPayload,
    moduleId: string,
    id: string,
    dto: UpdateLessonDto,
  ) {
    await this.findOne(user, moduleId, id);
    return this.prisma.lesson.update({ where: { id }, data: dto });
  }

  async remove(user: JwtPayload, moduleId: string, id: string) {
    await this.findOne(user, moduleId, id);
    return this.prisma.lesson.delete({ where: { id } });
  }
}
