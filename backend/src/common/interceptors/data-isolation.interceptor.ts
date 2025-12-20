import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from '../enums/role.enum';

/**
 * Interceptor to automatically inject universityId into the request query/body
 * for non-SUPER_ADMIN users. This ensures query-level isolation.
 */
@Injectable()
export class DataIsolationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.role !== Role.SUPER_ADMIN && user.universityId) {
            const universityId = user.universityId.toString();

            // Inject into query for GET requests
            if (request.query && !request.query.universityId) {
                request.query.universityId = universityId;
            }

            // Inject into body for POST/PATCH requests
            if (request.body && !request.body.universityId) {
                request.body.universityId = universityId;
            }

            // For HODs, also inject departmentId if they have one
            if (user.role === Role.HOD && user.departmentId && !request.query.departmentId) {
                request.query.departmentId = user.departmentId.toString();
            }
        }

        return next.handle();
    }
}
