import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto, userId: string) {
    return this.prisma.course.create({
      data: {
        organizationId: dto.isGlobal ? null : dto.organizationId,
        title: dto.title,
        description: dto.description,
        thumbnail: dto.thumbnail,
        duration: dto.duration,
        level: dto.level,
        status: dto.status,
        isGlobal: dto.isGlobal ?? false,
        createdByUserId: userId,
      },
    });
  }

  async findAllForOrganization(organizationId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const where = {
      OR: [{ organizationId }, { isGlobal: true }],
    };
    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: { orderBy: { order: 'asc' } },
            },
          },
        },
        orderBy: { title: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.course.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string, organizationId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        OR: [{ organizationId }, { isGlobal: true }],
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
            questionnaires: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async findModulesByCourse(courseId: string, organizationId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [{ organizationId }, { isGlobal: true }],
      },
    });
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return this.prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        questionnaires: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findFirst({
      where: { id, organizationId },
    });

    if (!course) {
      throw new NotFoundException(
        'Curso não encontrado ou sem permissão para editar',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }
}
