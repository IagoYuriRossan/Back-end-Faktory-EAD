import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: JwtPayload, dto: CreateCourseDto) {
    const isPlatformAdmin = user.role === UserRole.PLATFORM_ADMIN;
    const isGlobal = isPlatformAdmin && dto.isGlobal === true;

    if (dto.isGlobal && !isPlatformAdmin) {
      throw new BadRequestException(
        'Apenas PLATFORM_ADMIN pode criar cursos globais.',
      );
    }

    return this.prisma.course.create({
      data: {
        ...dto,
        isGlobal,
        organizationId: isGlobal ? null : user.organizationId,
        createdByUserId: user.sub,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.course.findMany({
      where: {
        OR: [
          { organizationId: user.organizationId },
          { isGlobal: true, organizationId: null },
        ],
      },
      include: { modules: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        OR: [
          { organizationId: user.organizationId },
          { isGlobal: true, organizationId: null },
        ],
      },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }

    return course;
  }

  async update(user: JwtPayload, id: string, dto: UpdateCourseDto) {
    const isPlatformAdmin = user.role === UserRole.PLATFORM_ADMIN;

    const course = await this.prisma.course.findFirst({
      where: {
        id,
        OR: [
          { organizationId: user.organizationId },
          ...(isPlatformAdmin
            ? [{ isGlobal: true, organizationId: null }]
            : []),
        ],
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }

    if (dto.isGlobal !== undefined && !isPlatformAdmin) {
      throw new BadRequestException(
        'Apenas PLATFORM_ADMIN pode alterar o status global de um curso.',
      );
    }

    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(user: JwtPayload, id: string) {
    const isPlatformAdmin = user.role === UserRole.PLATFORM_ADMIN;

    const course = await this.prisma.course.findFirst({
      where: {
        id,
        OR: [
          { organizationId: user.organizationId },
          ...(isPlatformAdmin
            ? [{ isGlobal: true, organizationId: null }]
            : []),
        ],
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }

    return this.prisma.course.delete({ where: { id } });
  }
}
