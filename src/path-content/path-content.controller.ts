import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/jwt/public.decorator';

/**
 * Learner-facing reads of the published path. Everything under `/path` is
 * routed here by the gateway; the outline and lesson endpoints arrive in P1-3.
 */
@ApiTags('path')
@Controller('path')
export class PathContentController {
    /** Reachability probe through the gateway (`/path` is this service's prefix). */
    @Public()
    @Get('ping')
    ping(): { service: string; status: string } {
        return { service: 'curriculum', status: 'ok' };
    }
}
