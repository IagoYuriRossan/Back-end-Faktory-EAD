import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuizDto } from './dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const quiz = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado');
    }
    return quiz;
  }

  async submit(
    quizId: string,
    userId: string,
    organizationId: string,
    dto: SubmitQuizDto,
  ) {
    const quiz = await this.prisma.questionnaire.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado');
    }

    if (dto.answers.length !== quiz.questions.length) {
      throw new BadRequestException(
        `Esperado ${quiz.questions.length} respostas, recebido ${dto.answers.length}`,
      );
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const results: any[] = [];

    for (const question of quiz.questions) {
      const answer = dto.answers.find((a) => a.questionId === question.id);
      if (!answer) {
        throw new BadRequestException(
          `Resposta faltando para a questão ${question.id}`,
        );
      }

      const selectedOption = question.options.find(
        (o) => o.id === answer.selectedOptionId,
      );
      if (!selectedOption) {
        throw new BadRequestException(
          `Opção inválida para a questão ${question.id}`,
        );
      }

      const isCorrect = selectedOption.isCorrect;
      const points = Number(question.points);
      totalPoints += points;
      if (isCorrect) earnedPoints += points;

      await this.prisma.userAnswer.create({
        data: {
          organizationId,
          userId,
          questionnaireId: quizId,
          questionId: question.id,
          selectedOptionId: selectedOption.id,
          isCorrect,
          scoreAwarded: isCorrect ? points : 0,
        },
      });

      results.push({
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        isCorrect,
      });
    }

    const score = totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    return {
      quizId,
      score,
      passed,
      passingScore: quiz.passingScore,
      answers: results,
      submittedAt: new Date().toISOString(),
    };
  }
}
