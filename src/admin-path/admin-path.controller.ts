import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    PipeTransform,
    Post,
    Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/jwt/current-user.decorator';
import { Roles } from '@/auth/jwt/roles.decorator';
import { type ReleaseSummary, ReleaseService } from '@/release/release.service';
import {
    AdminContentService,
    type AdminRecord,
    type AdminWriteResult,
} from './admin-content.service';
import type { AdminTree } from './admin-path.logic';
import { ADMIN_KINDS, type AdminKind } from './admin-records';
import {
    AdminPathService,
    type SeedPlanResult,
    type ValidationResult,
} from './admin-path.service';

/** `:kind` must be one of the editable tables. */
class AdminKindPipe implements PipeTransform<string, AdminKind> {
    transform(value: string): AdminKind {
        if ((ADMIN_KINDS as readonly string[]).includes(value))
            return value as AdminKind;
        throw new BadRequestException(
            `kind must be one of ${ADMIN_KINDS.join(', ')}`,
        );
    }
}

/**
 * Content authoring under `/admin/path` (the gateway routes it here). Admins
 * only: the `roles` claim of the access token must hold `admin`.
 */
@ApiTags('admin-path')
@Roles('admin')
@Controller('admin/path')
export class AdminPathController {
    constructor(
        private readonly admin: AdminPathService,
        private readonly content: AdminContentService,
        private readonly releases: ReleaseService,
    ) {}

    @Get('overview')
    @ApiOperation({
        summary: 'The working copy as a tree, with status and origin per row',
    })
    overview(): Promise<AdminTree> {
        return this.admin.overview();
    }

    @Get('validate')
    @ApiOperation({ summary: 'Run the publish checks on the working copy' })
    validate(): Promise<ValidationResult> {
        return this.admin.validate();
    }

    @Get('seed-plan')
    @ApiOperation({
        summary: 'What importing content/ would change, including conflicts',
    })
    seedPlan(): Promise<SeedPlanResult> {
        return this.admin.seedPlan();
    }

    @Get('releases')
    @ApiOperation({ summary: 'Every release, newest first' })
    list(): Promise<ReleaseSummary[]> {
        return this.releases.list();
    }

    // ─── Content (the working copy) ────────────────────────────────────────
    // Bodies are records in seed shape (see admin-records.ts); a write answers
    // with the record as stored and the working copy's validation.

    @Get('content/:kind/:slug')
    @ApiOperation({ summary: 'One row of the working copy, in seed shape' })
    get(
        @Param('kind', AdminKindPipe) kind: AdminKind,
        @Param('slug') slug: string,
    ): Promise<AdminRecord> {
        return this.content.get(kind, slug);
    }

    @Post('content/:kind')
    @ApiOperation({ summary: 'Create a row (DRAFT, no seed behind it)' })
    create(
        @Param('kind', AdminKindPipe) kind: AdminKind,
        @Body() body: Record<string, unknown>,
        @CurrentUser() adminId: string,
    ): Promise<AdminWriteResult> {
        return this.content.create(kind, body, adminId);
    }

    @Put('content/:kind/:slug')
    @ApiOperation({
        summary: 'Replace a row; it becomes DRAFT until the next release',
    })
    update(
        @Param('kind', AdminKindPipe) kind: AdminKind,
        @Param('slug') slug: string,
        @Body() body: Record<string, unknown>,
        @CurrentUser() adminId: string,
    ): Promise<AdminWriteResult> {
        return this.content.update(kind, slug, body, adminId);
    }

    @Delete('content/:kind/:slug')
    @ApiOperation({ summary: 'Archive a row (never a hard delete)' })
    archive(
        @Param('kind', AdminKindPipe) kind: AdminKind,
        @Param('slug') slug: string,
        @CurrentUser() adminId: string,
    ): Promise<AdminWriteResult> {
        return this.content.archive(kind, slug, adminId);
    }

    @Post('content/:kind/:slug/restore')
    @HttpCode(200)
    @ApiOperation({ summary: 'Bring an archived row back as DRAFT' })
    restore(
        @Param('kind', AdminKindPipe) kind: AdminKind,
        @Param('slug') slug: string,
        @CurrentUser() adminId: string,
    ): Promise<AdminWriteResult> {
        return this.content.restore(kind, slug, adminId);
    }
}
