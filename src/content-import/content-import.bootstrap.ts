import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_CONTENT_DIR, loadContent } from '@/content/content-loader';
import { ReleaseService } from '@/release/release.service';
import { ContentImportService } from './content-import.service';

/** How often `content/` is checked for changes. */
const POLL_INTERVAL_MS = 1000;

/**
 * Dev convenience (`CONTENT_IMPORT_ON_BOOT=true`): import `content/` at start
 * and publish when anything changed or nothing is published yet, so a fresh
 * stack shows the path. Then poll `content/` and do the same on every save,
 * so an edited unit shows up without a restart (`nest start --watch` only
 * watches `src/`). Polling, not `fs.watch`: through a Docker bind mount an
 * editor's atomic save (write a temp file, rename it over) sends no event, and
 * Linux's recursive watcher loses the replaced file for good. Failures are
 * logged, never fatal. Note a publish also releases any DRAFT admin edits in
 * the working copy.
 */
@Injectable()
export class ContentImportBootstrap
    implements OnApplicationBootstrap, OnModuleDestroy
{
    private readonly logger = new Logger(ContentImportBootstrap.name);
    private poll?: NodeJS.Timeout;
    /** Fingerprint of content/ at the last import: names, sizes, mtimes. */
    private fingerprint = '';
    private busy = false;

    constructor(
        private readonly config: ConfigService,
        private readonly importer: ContentImportService,
        private readonly releases: ReleaseService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        if (!this.config.get<boolean>('contentImport.onBoot')) return;

        this.fingerprint = await contentFingerprint();
        await this.importAndPublish('content import on boot');
        this.poll = setInterval(
            () => void this.checkForChanges(),
            POLL_INTERVAL_MS,
        );
        this.logger.log(`Watching ${DEFAULT_CONTENT_DIR} for changes`);
    }

    onModuleDestroy(): void {
        clearInterval(this.poll);
    }

    private async checkForChanges(): Promise<void> {
        if (this.busy) return;
        this.busy = true;
        try {
            const current = await contentFingerprint();
            if (current === this.fingerprint) return;
            this.fingerprint = current;
            await this.importAndPublish('content changed on disk');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Cannot check content/ for changes: ${message}`);
        } finally {
            this.busy = false;
        }
    }

    private async importAndPublish(note: string): Promise<void> {
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
                await this.releases.publish({ note });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Content import failed: ${message}`);
        }
    }
}

/** Every JSON file under content/ with its size and mtime, as one string. */
async function contentFingerprint(): Promise<string> {
    const files = (await readdir(DEFAULT_CONTENT_DIR, { recursive: true }))
        .filter((file) => file.endsWith('.json'))
        .sort();
    const parts = await Promise.all(
        files.map(async (file) => {
            const info = await stat(join(DEFAULT_CONTENT_DIR, file));
            return `${file}:${info.size}:${info.mtimeMs}`;
        }),
    );
    return parts.join('|');
}
