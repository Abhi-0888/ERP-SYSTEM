import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new Logger('HttpExceptionFilter');

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const errorResponse: ErrorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message:
                typeof exceptionResponse === 'object' &&
                    'message' in exceptionResponse
                    ? (exceptionResponse as any)['message']
                    : exceptionResponse,
        };

        // Log errors
        if (status >= 500) {
            this.logger.error(
                `[${request.method}] ${request.url} - ${JSON.stringify(errorResponse)}`,
                exception.stack,
            );
        } else {
            this.logger.warn(
                `[${request.method}] ${request.url} - ${errorResponse.message}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}

// Global catch-all filter for unexpected errors
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private logger = new Logger('AllExceptionsFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        this.logger.error(`Unexpected error:`, exception);

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: 'Internal server error',
        });
    }
}
