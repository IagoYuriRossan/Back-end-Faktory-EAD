import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUser } from '../../auth/interfaces';

/**
 * TenantInterceptor — Estratégia de Multi-tenancy
 *
 * Este interceptor é responsável por:
 *
 * 1. Extrair o `organization_id` do JWT do usuário autenticado.
 * 2. Injetar o `organizationId` no body e nos query params da requisição,
 *    garantindo que toda operação seja filtrada pelo tenant correto.
 * 3. Impedir que um usuário forje um `organizationId` diferente no body/params.
 *
 * Uso: Aplique via @UseInterceptors(TenantInterceptor) em controllers ou
 * rotas que devem respeitar isolamento multi-tenant.
 *
 * PLATFORM_ADMIN é isento deste interceptor pois pode operar cross-tenant.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    // Rotas públicas (sem user) passam direto
    if (!user) {
      return next.handle();
    }

    // ADMIN_EG pode operar cross-tenant
    if (user.role === 'ADMIN_EG') {
      return next.handle();
    }

    const orgId = user.organizationId;

    // Se o body tenta forjar outro organizationId, bloqueia
    if (request.body?.organizationId && request.body.organizationId !== orgId) {
      throw new ForbiddenException(
        'Você não pode operar em outra organização',
      );
    }

    // Injeta organizationId automaticamente no body
    if (request.body && typeof request.body === 'object') {
      request.body.organizationId = orgId;
    }

    // Injeta organizationId nos query params para consultas
    if (!request.query) {
      request.query = {};
    }
    request.query.organizationId = orgId;

    // Disponibiliza como propriedade para fácil acesso nos services
    request.organizationId = orgId;

    return next.handle();
  }
}
