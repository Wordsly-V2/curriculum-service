import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/jwt/roles.decorator';
import { type ReleaseSummary, ReleaseService } from '@/release/release.service';
import type { AdminTree } from './admin-path.logic';
import {
    AdminPathService,
    type SeedPlanResult,
    type ValidationResult,
} from './admin-path.service';

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
}
