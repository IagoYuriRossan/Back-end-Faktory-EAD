import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Métricas para ADMIN_CLIENTE — escopo da organização */
  async getOrgMetrics(organizationId: string) {
    const [
      totalStudents,
      activeStudents,
      coursesAvailable,
      progressRecords,
    ] = await Promise.all([
      this.prisma.user.count({ where: { organizationId } }),
      this.prisma.user.count({ where: { organizationId, isActive: true } }),
      this.prisma.course.count({
        where: {
          OR: [{ organizationId }, { isGlobal: true }],
          status: 'PUBLISHED',
        },
      }),
      this.prisma.userProgress.findMany({
        where: { organizationId },
        select: { isCompleted: true, lesson: { select: { module: { select: { courseId: true } } } } },
      }),
    ]);

    const totalProgress = progressRecords.length;
    const completed = progressRecords.filter((p) => p.isCompleted).length;
    const averageProgress = totalProgress > 0
      ? Math.round((completed / totalProgress) * 100)
      : 0;

    // Top courses by completions
    const courseCompletions = new Map<string, number>();
    for (const p of progressRecords) {
      if (p.isCompleted) {
        const courseId = p.lesson.module.courseId;
        courseCompletions.set(courseId, (courseCompletions.get(courseId) ?? 0) + 1);
      }
    }
    const topCoursesIds = [...courseCompletions.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topCourses = await Promise.all(
      topCoursesIds.map(async (courseId) => {
        const course = await this.prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true },
        });
        return {
          courseId,
          courseName: course?.title ?? '',
          completions: courseCompletions.get(courseId) ?? 0,
        };
      }),
    );

    return {
      totalStudents,
      activeStudents,
      coursesAvailable,
      averageProgress,
      topCourses,
    };
  }

  /** Métricas globais para ADMIN_EG */
  async getGlobalMetrics() {
    const [
      totalOrganizations,
      totalStudents,
      totalCourses,
      totalLessons,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
    ]);

    const orgsWithStats = await this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
      take: 10,
    });

    return {
      totalOrganizations,
      totalStudents,
      totalCourses,
      totalLessons,
      topOrganizations: orgsWithStats.map((o) => ({
        id: o.id,
        name: o.name,
        userCount: o._count.users,
      })),
    };
  }
}
