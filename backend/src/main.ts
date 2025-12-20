import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS with specific origin
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
