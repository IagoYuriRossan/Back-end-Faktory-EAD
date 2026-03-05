import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        questionnaires: true,
      },
    });
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }
    return module;
  }

  async findLessonsByModule(moduleId: string) {
    const module = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }
}
