import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import morgan from 'morgan';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Trust the first reverse proxy (Nginx, Cloudflare, etc.)
    // This ensures req.ip returns the real visitor IP, not the proxy's IP
    app.set('trust proxy', 1);

    // HTTP request logger
    app.use(morgan('dev'));

    // Enable Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strips out properties that don't have decorators
            forbidNonWhitelisted: true, // Throws an error if extra properties are sent
            transform: true, // Automatically transforms payloads to be objects typed according to their DTO classes
        }),
    );

    // Apply global interceptor for standardizing successful responses
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Apply global exception filter for standardizing error responses
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
