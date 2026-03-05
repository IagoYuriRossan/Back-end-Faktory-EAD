import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthenticatedUser } from '../auth/interfaces';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Métricas da organização — ADMIN_CLIENTE */
  @Get('metrics')
  @Roles(UserRole.ADMIN_EG, UserRole.ADMIN_CLIENTE)
  getMetrics(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getOrgMetrics(user.organizationId);
  }

  /** Métricas globais — ADMIN_EG */
  @Get('admin')
  @Roles(UserRole.ADMIN_EG)
  getAdminMetrics() {
    return this.dashboardService.getGlobalMetrics();
  }
}
