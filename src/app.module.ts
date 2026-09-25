import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/jwt/auth.module';
import { AccessGuard } from './auth/jwt/access.guard';
import { RolesGuard } from './auth/jwt/roles.guard';
import { UserScopeGuard } from './auth/jwt/user-scope.guard';
import { AdminPathModule } from './admin-path/admin-path.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { ContentImportModule } from './content-import/content-import.module';
import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';
import { HealthModule } from './health/health.module';
import { MessagingModule } from './messaging/messaging.module';
import { PathContentModule } from './path-content/path-content.module';
import { PathProgressModule } from './path-progress/path-progress.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReleaseModule } from './release/release.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { RequestContextLogger } from './common/request-context-logger';

@Module({
    imports: [
        HealthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate: validateEnv,
        }),
        AuthModule,
        CacheModule,
        PrismaModule,
        MessagingModule,
        PathContentModule,
        PathProgressModule,
        ReleaseModule,
        ContentImportModule,
        AdminPathModule,
    ],
    controllers: [AppController],
    providers: [
        RequestContextLogger,
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        AppService,
        // Deny-by-default: AccessGuard establishes who the caller is, RolesGuard
        // (right after it) enforces @Roles('admin') on the authoring API, and
        // UserScopeGuard refuses requests that try to name a user.
        { provide: APP_GUARD, useClass: AccessGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: UserScopeGuard },
    ],
})
export class AppModule {}
