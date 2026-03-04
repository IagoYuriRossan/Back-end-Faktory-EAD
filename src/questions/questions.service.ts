import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyQuestionnaireAccess(
    questionnaireId: string,
    organizationId: string,
    role: UserRole,
  ) {
    const orgFilter = {
      OR: [
        { organizationId },
        ...(role === UserRole.PLATFORM_ADMIN
          ? [{ isGlobal: true, organizationId: null }]
          : []),
      ],
    };

    const questionnaire = await this.prisma.questionnaire.findFirst({
      where: {
        id: questionnaireId,
        OR: [
          { module: { course: orgFilter } },
          { lesson: { module: { course: orgFilter } } },
        ],
      },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionário não encontrado.');
    }

    return questionnaire;
  }

  async create(
    user: JwtPayload,
    questionnaireId: string,
    dto: CreateQuestionDto,
  ) {
    await this.verifyQuestionnaireAccess(
      questionnaireId,
      user.organizationId,
      user.role,
    );

    const { options, ...questionData } = dto;

    return this.prisma.question.create({
      data: {
        ...questionData,
        questionnaireId,
        options: { create: options },
      },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findAll(user: JwtPayload, questionnaireId: string) {
    await this.verifyQuestionnaireAccess(
      questionnaireId,
      user.organizationId,
      user.role,
    );

    return this.prisma.question.findMany({
      where: { questionnaireId },
      orderBy: { sortOrder: 'asc' },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findOne(user: JwtPayload, questionnaireId: string, id: string) {
    await this.verifyQuestionnaireAccess(
      questionnaireId,
      user.organizationId,
      user.role,
    );

    const question = await this.prisma.question.findFirst({
      where: { id, questionnaireId },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!question) {
      throw new NotFoundException('Questão não encontrada.');
    }

    return question;
  }

  async update(
    user: JwtPayload,
    questionnaireId: string,
    id: string,
    dto: UpdateQuestionDto,
  ) {
    await this.findOne(user, questionnaireId, id);
    return this.prisma.question.update({
      where: { id },
      data: dto,
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(user: JwtPayload, questionnaireId: string, id: string) {
    await this.findOne(user, questionnaireId, id);
    return this.prisma.question.delete({ where: { id } });
  }
}
