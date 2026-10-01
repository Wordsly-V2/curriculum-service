import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { buildCorsOptions, parseCorsOrigins } from '@/config/cors';
import helmet from 'helmet';
import { requestIdMiddleware } from '@/common/request-id.middleware';
import { RequestContextLogger } from '@/common/request-context-logger';
import { CONSUMED_TOPICS } from '@/messaging/constants';
import { ensureTopics } from '@/messaging/ensure-topics';

const bootLogger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Above the 100kb default: an admin imports whole unit files (the largest
    // seed file is ~60kb and they grow).
    app.useBodyParser('json', { limit: '1mb' });

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

    // Kafka is optional: KafkaProducerService no-ops and no consumer is
    // connected when KAFKA_BROKERS is empty, so the HTTP API never depends on
    // it. The consumer handles `user_deleted` (src/user-data/), committing by
    // hand like the other services.
    const brokerList = (configService.get<string>('kafka.brokers') ?? '')
        .split(',')
        .filter(Boolean);
    if (brokerList.length > 0) {
        const ca = configService.get<string>('kafka.ca') ?? '';
        const cert = configService.get<string>('kafka.cert') ?? '';
        const key = configService.get<string>('kafka.key') ?? '';
        // TLS only with material for it; the local broker is plaintext.
        const kafkaSsl =
            ca || cert || key
                ? { rejectUnauthorized: true, ca, cert, key }
                : false;
        await ensureTopics({
            brokers: brokerList,
            ssl: kafkaSsl,
            topics: CONSUMED_TOPICS,
            logger: bootLogger,
        });
        app.connectMicroservice({
            transport: Transport.KAFKA,
            options: {
                clientId: 'curriculum-service-client',
                client: { brokers: brokerList, ssl: kafkaSsl },
                consumer: { groupId: 'curriculum-service-consumer' },
                run: { autoCommit: false },
            },
        });
    }

    const appPort = configService.get<number>('port');
    await app.startAllMicroservices();
    await app.listen(appPort as number);
    bootLogger.log(`Curriculum Service HTTP is running on port ${appPort}`);
    bootLogger.log(
        `CORS enabled origins: ${parseCorsOrigins(corsEnabledOrigins).join(', ') || 'none'}`,
    );
}

void bootstrap();
