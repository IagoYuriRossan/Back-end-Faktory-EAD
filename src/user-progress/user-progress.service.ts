import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';

@Injectable()
export class UserProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(user: JwtPayload, dto: UpsertProgressDto) {
    const completedAt = dto.isCompleted === true ? new Date() : null;

    return this.prisma.userProgress.upsert({
      where: {
        organizationId_userId_lessonId: {
          organizationId: user.organizationId,
          userId: user.sub,
          lessonId: dto.lessonId,
        },
      },
      update: {
        lastTimestampWatchedSeconds: dto.lastTimestampWatchedSeconds,
        isCompleted: dto.isCompleted ?? false,
        completedAt,
      },
      create: {
        organizationId: user.organizationId,
        userId: user.sub,
        lessonId: dto.lessonId,
        lastTimestampWatchedSeconds: dto.lastTimestampWatchedSeconds,
        isCompleted: dto.isCompleted ?? false,
        completedAt,
      },
    });
  }

  findAll(user: JwtPayload) {
    return this.prisma.userProgress.findMany({
      where: { organizationId: user.organizationId, userId: user.sub },
      include: { lesson: { select: { id: true, title: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findByLesson(user: JwtPayload, lessonId: string) {
    return this.prisma.userProgress.findUnique({
      where: {
        organizationId_userId_lessonId: {
          organizationId: user.organizationId,
          userId: user.sub,
          lessonId,
        },
      },
    });
  }
}
