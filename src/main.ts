import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { buildCorsOptions, parseCorsOrigins } from '@/config/cors';
import helmet from 'helmet';
import { requestIdMiddleware } from '@/common/request-id.middleware';
import { RequestContextLogger } from '@/common/request-context-logger';

const bootLogger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useLogger(app.get(RequestContextLogger));

    // First, so every later middleware, guard and handler runs inside
    // the store and logs the same id the caller was given back.
    app.use(requestIdMiddleware);

    // CSP is off because the Swagger UI at /api needs its inline bootstrap
    // script; every other response is JSON.
    app.use(helmet({ contentSecurityPolicy: false }));

    const configService = app.get(ConfigService);
    const corsEnabledOrigins = configService.get<string>('corsEnabledOrigins');
    app.enableCors(buildCorsOptions(corsEnabledOrigins));

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Curriculum Service API')
        .setDescription(
            'Wordsly Path: the public curriculum, learner progression and admin authoring',
        )
        .setVersion('1.0')
        .addTag('health', 'Health check endpoints')
        .addTag('path', 'Learner-facing path endpoints')
        .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

    // Kafka is producer-only here (retire events), so no microservice is
    // connected: KafkaProducerService no-ops when KAFKA_BROKERS is empty.
    const appPort = configService.get<number>('port');
    await app.listen(appPort as number);
    bootLogger.log(`Curriculum Service HTTP is running on port ${appPort}`);
    bootLogger.log(
        `CORS enabled origins: ${parseCorsOrigins(corsEnabledOrigins).join(', ') || 'none'}`,
    );
}

void bootstrap();
