import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadContent } from './content-loader';

describe('loadContent', () => {
    it('accepts the seed shipped in content/', async () => {
        const { corpus, errors } = await loadContent(
            join(__dirname, '../../content'),
        );
        expect(errors).toEqual([]);
        expect(corpus.units.length).toBeGreaterThan(0);
    });

    describe('with a scratch directory', () => {
        let dir: string;

        beforeEach(async () => {
            dir = await mkdtemp(join(tmpdir(), 'content-'));
            await mkdir(join(dir, 'units', 'a1'), { recursive: true });
            await writeFile(
                join(dir, 'stages.json'),
                JSON.stringify([
                    {
                        slug: 'pre-a1',
                        cefr: 'PRE_A1',
                        order: 1,
                        title: 't',
                        titleVi: 't',
                    },
                ]),
            );
        });

        afterEach(() => rm(dir, { recursive: true, force: true }));

        it('reports schema errors with the file and path', async () => {
            await writeFile(
                join(dir, 'units', 'a1', 'u.json'),
                JSON.stringify({ slug: 'u' }),
            );
            const { errors } = await loadContent(dir);
            expect(
                errors.some((e) => e.startsWith('units/a1/u.json stage:')),
            ).toBe(true);
        });

        it('reports a unit filed under the wrong stage or name', async () => {
            const unit = {
                slug: 'u1',
                stage: 'pre-a1',
                order: 1,
                title: 't',
                titleVi: 't',
                canDo: ['c'],
                items: [],
                dialogues: [],
                lessons: [
                    {
                        slug: 'l1',
                        title: 't',
                        titleVi: 't',
                        estimatedMinutes: 5,
                        items: [],
                        steps: [
                            {
                                type: 'WARMUP',
                                payload: { schemaVersion: 1, maxItems: 5 },
                            },
                        ],
                    },
                ],
            };
            await writeFile(
                join(dir, 'units', 'a1', 'other.json'),
                JSON.stringify(unit),
            );
            const { errors } = await loadContent(dir);
            expect(errors).toEqual([
                'units/a1/other.json: file name must be u1.json',
                'units/a1/other.json: must be in units/pre-a1/',
            ]);
        });

        it('reports invalid JSON', async () => {
            await writeFile(join(dir, 'units', 'a1', 'u.json'), '{');
            const { errors } = await loadContent(dir);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toMatch(/^units\/a1\/u\.json: /);
        });
    });
});
