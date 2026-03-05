import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        questionnaires: {
          include: { questions: { include: { options: true } } },
        },
      },
    });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    return lesson;
  }
}
