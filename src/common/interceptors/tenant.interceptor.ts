import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../guards/jwt-auth.guard';

/**
 * TenantInterceptor extracts the `organizationId` from the authenticated
 * user's JWT payload and attaches it to the request object so that all
 * downstream service calls can apply the multi-tenant filter automatically.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.organizationId) {
      (request as RequestWithUser & { tenantId: string }).tenantId =
        request.user.organizationId;
    }

    return next.handle();
  }
}
