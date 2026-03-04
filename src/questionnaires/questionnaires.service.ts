import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionnairesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyParentAccess(
    dto: CreateQuestionnaireDto,
    organizationId: string,
    role: UserRole,
  ) {
    if ((!dto.moduleId && !dto.lessonId) || (dto.moduleId && dto.lessonId)) {
      throw new BadRequestException(
        'O questionário deve estar vinculado a um módulo OU a uma aula (nunca ambos).',
      );
    }

    const orgFilter = {
      OR: [
        { organizationId },
        ...(role === UserRole.PLATFORM_ADMIN
          ? [{ isGlobal: true, organizationId: null }]
          : []),
      ],
    };

    if (dto.moduleId) {
      const module = await this.prisma.module.findFirst({
        where: { id: dto.moduleId, course: orgFilter },
      });
      if (!module) throw new NotFoundException('Módulo não encontrado.');
    }

    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findFirst({
        where: {
          id: dto.lessonId,
          module: { course: orgFilter },
        },
      });
      if (!lesson) throw new NotFoundException('Aula não encontrada.');
    }
  }

  async create(user: JwtPayload, dto: CreateQuestionnaireDto) {
    await this.verifyParentAccess(dto, user.organizationId, user.role);
    return this.prisma.questionnaire.create({
      data: {
        title: dto.title,
        description: dto.description,
        moduleId: dto.moduleId ?? null,
        lessonId: dto.lessonId ?? null,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.questionnaire.findMany({
      where: {
        OR: [
          {
            module: {
              course: {
                OR: [
                  { organizationId: user.organizationId },
                  { isGlobal: true, organizationId: null },
                ],
              },
            },
          },
          {
            lesson: {
              module: {
                course: {
                  OR: [
                    { organizationId: user.organizationId },
                    { isGlobal: true, organizationId: null },
                  ],
                },
              },
            },
          },
        ],
      },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const questionnaire = await this.prisma.questionnaire.findFirst({
      where: {
        id,
        OR: [
          {
            module: {
              course: {
                OR: [
                  { organizationId: user.organizationId },
                  { isGlobal: true, organizationId: null },
                ],
              },
            },
          },
          {
            lesson: {
              module: {
                course: {
                  OR: [
                    { organizationId: user.organizationId },
                    { isGlobal: true, organizationId: null },
                  ],
                },
              },
            },
          },
        ],
      },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { options: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado.');
    }

    return questionnaire;
  }

  async update(user: JwtPayload, id: string, dto: UpdateQuestionnaireDto) {
    await this.findOne(user, id);
    return this.prisma.questionnaire.update({ where: { id }, data: dto });
  }

  async remove(user: JwtPayload, id: string) {
    await this.findOne(user, id);
    return this.prisma.questionnaire.delete({ where: { id } });
  }
}
