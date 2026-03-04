import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';

@Injectable()
export class UserAnswersService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(user: JwtPayload, dto: SubmitAnswerDto) {
    if (!dto.selectedOptionId && !dto.answerText) {
      throw new BadRequestException(
        'É necessário fornecer uma opção selecionada ou texto de resposta.',
      );
    }

    const question = await this.prisma.question.findFirst({
      where: {
        id: dto.questionId,
        questionnaireId: dto.questionnaireId,
      },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException('Questão não encontrada.');
    }

    let isCorrect: boolean | null = null;
    let scoreAwarded = 0;

    if (dto.selectedOptionId) {
      const selectedOption = question.options.find(
        (o) => o.id === dto.selectedOptionId,
      );
      if (!selectedOption) {
        throw new BadRequestException(
          'Opção selecionada não pertence a esta questão.',
        );
      }
      isCorrect = selectedOption.isCorrect;
      scoreAwarded = isCorrect ? Number(question.points) : 0;
    }

    return this.prisma.userAnswer.create({
      data: {
        organizationId: user.organizationId,
        userId: user.sub,
        questionnaireId: dto.questionnaireId,
        questionId: dto.questionId,
        selectedOptionId: dto.selectedOptionId ?? null,
        answerText: dto.answerText ?? null,
        isCorrect,
        scoreAwarded,
      },
    });
  }

  findByQuestionnaire(user: JwtPayload, questionnaireId: string) {
    return this.prisma.userAnswer.findMany({
      where: {
        organizationId: user.organizationId,
        userId: user.sub,
        questionnaireId,
      },
      include: {
        question: { select: { id: true, prompt: true, points: true } },
        selectedOption: {
          select: { id: true, optionText: true, isCorrect: true },
        },
      },
      orderBy: { answeredAt: 'asc' },
    });
  }
}
