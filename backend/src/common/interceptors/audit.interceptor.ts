import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;

        // We only want to log modifying actions (POST, PATCH, DELETE)
        if (['POST', 'PATCH', 'DELETE'].includes(method) && user) {
            return next.handle().pipe(
                tap(async () => {
                    const module = url.split('/')[1]?.toUpperCase() || 'SYSTEM';

                    await this.auditService.create({
                        action: this.getActionFromMethod(method),
                        module,
                        userId: user.userId || user.id || user._id,
                        username: user.username,
                        payload: body,
                        endpoint: url,
                        method,
                        universityId: user.universityId,
                    });
                }),
            );
        }

        return next.handle();
    }

    private getActionFromMethod(method: string): string {
        switch (method) {
            case 'POST':
                return 'CREATE';
            case 'PATCH':
                return 'UPDATE';
            case 'DELETE':
                return 'DELETE';
            default:
                return 'UNKNOWN';
        }
    }
}
