import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadContent } from '@/content/content-loader';
import { ReleaseService } from '@/release/release.service';
import { ContentImportService } from './content-import.service';

/**
 * Dev convenience (`CONTENT_IMPORT_ON_BOOT=true`): import `content/` at start
 * and publish when anything changed or nothing is published yet, so a fresh
 * stack shows the path. Failures are logged, never fatal. Note the publish
 * also releases any DRAFT admin edits in the working copy.
 */
@Injectable()
export class ContentImportBootstrap implements OnApplicationBootstrap {
    private readonly logger = new Logger(ContentImportBootstrap.name);

    constructor(
        private readonly config: ConfigService,
        private readonly importer: ContentImportService,
        private readonly releases: ReleaseService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        if (!this.config.get<boolean>('contentImport.onBoot')) return;

        try {
            const { corpus, errors } = await loadContent();
            if (errors.length > 0) {
                this.logger.error(
                    `Content is invalid, not imported:\n  - ${errors.join('\n  - ')}`,
                );
                return;
            }

            const { summary } = await this.importer.run(corpus);
            const changed = summary.insert + summary.update > 0;
            if (changed || !(await this.releases.activeRelease())) {
                await this.releases.publish({ note: 'content import on boot' });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Content import on boot failed: ${message}`);
        }
    }
}
