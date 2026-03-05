import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProgress(userId: string, organizationId: string) {
    const progresses = await this.prisma.userProgress.findMany({
      where: { userId, organizationId },
      include: {
        lesson: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
      },
    });

    // Agrupa por curso
    const courseMap = new Map<string, any>();
    for (const p of progresses) {
      const courseId = p.lesson.module.courseId;
      const course = p.lesson.module.course;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          userId,
          courseId,
          courseName: course.title,
          completedLessons: [],
          lastAccessedAt: null,
          completedAt: null,
        });
      }
      const entry = courseMap.get(courseId);
      if (p.isCompleted) {
        entry.completedLessons.push(p.lessonId);
      }
      if (!entry.lastAccessedAt || p.updatedAt > entry.lastAccessedAt) {
        entry.lastAccessedAt = p.updatedAt;
      }
    }
    return Array.from(courseMap.values());
  }

  async getCourseProgress(userId: string, organizationId: string, courseId: string) {
    // Busca todos os lessons do curso
    const allLessons = await this.prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true, moduleId: true },
    });

    if (allLessons.length === 0) {
      throw new NotFoundException('Curso não encontrado ou sem aulas');
    }

    const lessonIds = allLessons.map((l) => l.id);

    const completedProgresses = await this.prisma.userProgress.findMany({
      where: { userId, organizationId, lessonId: { in: lessonIds }, isCompleted: true },
    });

    const completedLessonIds = completedProgresses.map((p) => p.lessonId);

    // Identifica módulos completos (todos os lessons concluídos)
    const moduleMap = new Map<string, string[]>();
    for (const l of allLessons) {
      if (!moduleMap.has(l.moduleId)) moduleMap.set(l.moduleId, []);
      moduleMap.get(l.moduleId)!.push(l.id);
    }
    const completedModules: string[] = [];
    for (const [modId, lessonIdsInModule] of moduleMap.entries()) {
      if (lessonIdsInModule.every((id) => completedLessonIds.includes(id))) {
        completedModules.push(modId);
      }
    }

    const overallProgress = allLessons.length > 0
      ? Math.round((completedLessonIds.length / allLessons.length) * 100)
      : 0;

    const status =
      overallProgress === 0
        ? 'NOT_STARTED'
        : overallProgress === 100
        ? 'COMPLETED'
        : 'IN_PROGRESS';

    const lastAccess = completedProgresses.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    )[0];

    return {
      userId,
      courseId,
      completedLessons: completedLessonIds,
      completedModules,
      overallProgress,
      status,
      lastAccessedAt: lastAccess?.updatedAt ?? null,
      completedAt: status === 'COMPLETED' ? lastAccess?.completedAt ?? null : null,
    };
  }

  async completeLesson(userId: string, organizationId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    const now = new Date();
    const progress = await this.prisma.userProgress.upsert({
      where: {
        uq_user_progress_once: { organizationId, userId, lessonId },
      },
      update: {
        isCompleted: true,
        completedAt: now,
      },
      create: {
        organizationId,
        userId,
        lessonId,
        isCompleted: true,
        completedAt: now,
      },
    });

    return progress;
  }
}
