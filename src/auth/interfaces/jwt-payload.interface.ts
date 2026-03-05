import { UserRole } from '@prisma/client';
import { FrontendRole } from '../../common/utils/role-mapper';

export interface JwtPayload {
  sub: string; // user id
  userId: string; // alias de sub (para compatibilidade com frontend)
  organizationId: string | null;
  role: FrontendRole | string;
  email: string;
  name: string;
}

export interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

export interface AuthenticatedUser {
  userId: string;
  organizationId: string | null;
  role: FrontendRole | string;
  email: string;
  name: string;
}
