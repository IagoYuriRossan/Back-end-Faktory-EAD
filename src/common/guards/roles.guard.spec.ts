import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

function createMockExecutionContext(role: UserRole): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockExecutionContext(UserRole.STUDENT);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ORG_ADMIN]);
    const ctx = createMockExecutionContext(UserRole.ORG_ADMIN);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.PLATFORM_ADMIN]);
    const ctx = createMockExecutionContext(UserRole.STUDENT);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
