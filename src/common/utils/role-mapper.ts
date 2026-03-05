import { UserRole } from '@prisma/client';

export enum FrontendRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  STUDENT = 'STUDENT',
}

export function toFrontendRole(role: UserRole | string): FrontendRole {
  switch (role) {
    case 'ADMIN_EG':
      return FrontendRole.PLATFORM_ADMIN;
    case 'ADMIN_CLIENTE':
      return FrontendRole.ORG_ADMIN;
    case 'ALUNO':
      return FrontendRole.STUDENT;
    // if already frontend role
    case FrontendRole.PLATFORM_ADMIN:
    case FrontendRole.ORG_ADMIN:
    case FrontendRole.STUDENT:
      return role as FrontendRole;
    default:
      return FrontendRole.STUDENT;
  }
}

export function toBackendRole(front: string): UserRole {
  switch (front) {
    case FrontendRole.PLATFORM_ADMIN:
      return 'ADMIN_EG';
    case FrontendRole.ORG_ADMIN:
      return 'ADMIN_CLIENTE';
    case FrontendRole.STUDENT:
      return 'ALUNO';
    default:
      return front as UserRole;
  }
}
