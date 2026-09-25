/**
 * Load the seed under content/ into the curriculum working copy.
 *
 *   npm run content:import
 *   npm run content:import -- --dry-run
 *   npm run content:import -- --publish     (then publish a new release)
 *   npm run content:import -- --force <slug|kind:slug> [--force …]
 *   npm run content:import -- --dir <path>
 *
 * Idempotent: rows are inserted when new, updated when the seed changed and no
 * admin edited them, and reported as conflicts when both changed (--force lets
 * the seed win). New rows are DRAFT; --publish validates the whole working copy
 * and publishes it as a new active release.
 */
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { DEFAULT_CONTENT_DIR, loadContent } from '@/content/content-loader';
import { CacheService } from '@/cache/cache.service';
import { ContentImportService } from '@/content-import/content-import.service';
import { KafkaProducerService } from '@/messaging/kafka-producer.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ContentInvalidError, ReleaseService } from '@/release/release.service';

loadDotenv({ quiet: true });

function parseArgs(args: string[]) {
    const force = new Set<string>();
    let dir = DEFAULT_CONTENT_DIR;
    let dryRun = false;
    let publish = false;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--dry-run') dryRun = true;
        else if (arg === '--publish') publish = true;
        else if (arg === '--force' && args[i + 1]) force.add(args[++i]);
        else if (arg === '--dir' && args[i + 1]) dir = resolve(args[++i]);
        else throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
    if (dryRun && publish) {
        throw new Error('--dry-run and --publish cannot be combined');
    }
    return { force, dir, dryRun, publish };
}

async function main(): Promise<void> {
    const { force, dir, dryRun, publish } = parseArgs(process.argv.slice(2));

    const { corpus, errors } = await loadContent(dir);
    if (errors.length > 0) {
        console.error(`Content in ${dir} is invalid:`);
        for (const error of errors) console.error(`  - ${error}`);
        process.exitCode = 1;
        return;
    }

    const prisma = new PrismaService();
    try {
        await prisma.$connect();
        const { plan, summary } = await new ContentImportService(prisma).run(
            corpus,
            { force, dryRun },
        );

        for (const { action, reason, seed } of plan) {
            if (action === 'skip' && reason === 'unchanged') continue;
            console.log(
                `${action.padEnd(8)} ${seed.kind}:${seed.slug} (${reason})`,
            );
        }
        console.log(
            `${dryRun ? '[dry run] ' : ''}insert ${summary.insert}, update ${summary.update}, ` +
                `skip ${summary.skip}, conflict ${summary.conflict}`,
        );
        if (summary.conflict > 0) {
            console.log(
                'Conflicts keep the admin version. Re-run with --force <slug> to take the seed.',
            );
        }

        if (publish) {
            // The cache only to drop the release pointer after publishing; Kafka
            // to retire items the release drops (a no-op without KAFKA_BROKERS).
            const env: Record<string, string | undefined> = {
                'redis.url': process.env.REDIS_URL,
                'kafka.brokers': process.env.KAFKA_BROKERS,
                'kafka.ca': process.env.KAFKA_CA,
                'kafka.cert': process.env.KAFKA_CERT,
                'kafka.key': process.env.KAFKA_KEY,
            };
            const config = { get: (key: string) => env[key] } as never;
            const cache = new CacheService(config);
            const kafka = new KafkaProducerService(config);
            await cache.onModuleInit();
            await kafka.onModuleInit();
            try {
                const release = await new ReleaseService(
                    prisma,
                    cache,
                    kafka,
                ).publish({ note: 'npm run content:import --publish' });
                console.log(
                    `Published release v${release.version} (${release.id})` +
                        (release.retiredItemIds.length > 0
                            ? `, retired ${release.retiredItemIds.length} items`
                            : ''),
                );
            } catch (err: unknown) {
                if (!(err instanceof ContentInvalidError)) throw err;
                console.error('Not published, the working copy is invalid:');
                for (const error of err.errors) console.error(`  - ${error}`);
                process.exitCode = 1;
            } finally {
                await cache.onModuleDestroy();
                await kafka.onModuleDestroy();
            }
        }
    } finally {
        await prisma.onModuleDestroy();
    }
}

main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
