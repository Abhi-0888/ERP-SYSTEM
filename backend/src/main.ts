import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS with flexible origin config (comma-separated values supported)
    const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

    app.enableCors({
        origin: (origin, callback) => {
            // Allow non-browser/server-to-server requests with no origin (e.g., curl, server-side)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Also allow common localhost variants if explicitly requested
            const hostVariants = ['http://localhost:3000', 'http://127.0.0.1:3000'];
            if (hostVariants.includes(origin) && allowedOrigins.includes('http://localhost:3000')) {
                return callback(null, true);
            }
            return callback(new Error('CORS policy: Origin not allowed'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global exception filters
    app.useGlobalFilters(
        new AllExceptionsFilter(),
        new HttpExceptionFilter(),
    );

    const port = process.env.PORT || 5001;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
