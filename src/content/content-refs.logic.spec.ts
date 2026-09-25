import { checkContentRefs } from './content-refs.logic';
import type {
    ContentCorpus,
    ItemSeed,
    LessonSeed,
    UnitFile,
} from './content.schema';

const item = (slug: string, type: ItemSeed['type'] = 'LEXICAL'): ItemSeed => ({
    slug,
    type,
    text: slug,
    meaningVi: slug,
    examples: [],
    ...(type === 'PATTERN'
        ? {
              pattern: {
                  template: 'I am {name}.',
                  slots: [{ name: 'name', hintVi: 'tên', options: ['Lan'] }],
              },
          }
        : {}),
});

const lesson = (
    slug: string,
    links: LessonSeed['items'],
    steps?: LessonSeed['steps'],
): LessonSeed => ({
    slug,
    title: slug,
    titleVi: slug,
    estimatedMinutes: 10,
    items: links,
    steps: steps ?? [
        { type: 'WARMUP', payload: { schemaVersion: 1, maxItems: 5 } },
    ],
});

const unit = (
    slug: string,
    order: number,
    overrides: Partial<UnitFile> = {},
): UnitFile => ({
    slug,
    stage: 'pre-a1',
    order,
    title: slug,
    titleVi: slug,
    canDo: ['x'],
    items: [],
    dialogues: [],
    lessons: [],
    ...overrides,
});

const corpus = (...units: UnitFile[]): ContentCorpus => ({
    stages: [
        { slug: 'pre-a1', cefr: 'PRE_A1', order: 1, title: 's', titleVi: 's' },
        { slug: 'a1', cefr: 'A1', order: 2, title: 's', titleVi: 's' },
    ],
    units,
});

/** Two units: u1 introduces a and b, u2 introduces c and recycles a. */
const valid = () =>
    corpus(
        unit('u1', 1, {
            items: [item('a'), item('b')],
            lessons: [
                lesson('u1-l1', [
                    { item: 'a', role: 'INTRODUCE' },
                    { item: 'b', role: 'INTRODUCE' },
                ]),
            ],
        }),
        unit('u2', 2, {
            items: [item('c')],
            lessons: [
                lesson('u2-l1', [
                    { item: 'c', role: 'INTRODUCE' },
                    { item: 'a', role: 'RECYCLE' },
                ]),
            ],
        }),
    );

describe('checkContentRefs', () => {
    it('accepts a consistent corpus', () => {
        expect(checkContentRefs(valid())).toEqual([]);
    });

    it('reports duplicate slugs and unit positions', () => {
        const c = valid();
        c.units[1].order = 1;
        c.units[1].items.push(item('a'));
        expect(checkContentRefs(c)).toEqual(
            expect.arrayContaining([
                'item a: duplicate slug',
                'unit u2: order 1 already used by u1',
            ]),
        );
    });

    it('reports an unknown stage', () => {
        const c = valid();
        c.units[0].stage = 'z9';
        expect(checkContentRefs(c)).toContain('unit u1: unknown stage z9');
    });

    it('requires every item to be introduced once, in its own unit', () => {
        const c = valid();
        c.units[0].lessons[0].items.pop(); // b never introduced
        c.units[1].lessons[0].items.push({ item: 'a', role: 'INTRODUCE' });
        expect(checkContentRefs(c)).toEqual(
            expect.arrayContaining([
                'unit u1: item b is never introduced',
                'lesson u2-l1: item a is introduced twice',
                'lesson u2-l1: item a is linked twice',
            ]),
        );
    });

    it('rejects introducing an item another unit defines', () => {
        const c = valid();
        c.units[1].lessons[0].items[0] = { item: 'b', role: 'INTRODUCE' };
        c.units[0].lessons[0].items.pop();
        expect(checkContentRefs(c)).toContain(
            'lesson u2-l1: introduces b, which unit u2 does not define',
        );
    });

    it('rejects recycling before introduction, in stage and unit order', () => {
        const c = valid();
        // u2 recycles a; moving u1 to a later stage puts a's introduction after it.
        c.units[0].stage = 'a1';
        expect(checkContentRefs(c)).toContain(
            'lesson u2-l1: recycles a before it is introduced',
        );
    });

    it('checks step references against the lesson and unit', () => {
        const c = valid();
        c.units[1].items.push(item('p', 'PATTERN'));
        c.units[1].lessons[0].items.push({ item: 'p', role: 'INTRODUCE' });
        c.units[1].lessons[0].steps = [
            { type: 'INTRO', payload: { schemaVersion: 1, items: ['c', 'a'] } },
            {
                type: 'PRACTICE',
                payload: {
                    schemaVersion: 1,
                    modes: ['flashcard'],
                    items: ['b'],
                },
            },
            {
                type: 'PATTERN_DRILL',
                payload: {
                    schemaVersion: 1,
                    pattern: 'c',
                    prompts: [{ cueVi: 'x', slots: {}, answer: 'x' }],
                },
            },
            {
                type: 'PATTERN_DRILL',
                payload: {
                    schemaVersion: 1,
                    pattern: 'p',
                    prompts: [{ cueVi: 'x', slots: { age: '9' }, answer: 'x' }],
                },
            },
            {
                type: 'DIALOGUE',
                payload: { schemaVersion: 1, dialogue: 'd', mode: 'listen' },
            },
            {
                type: 'QUIZ',
                payload: {
                    schemaVersion: 1,
                    questions: [
                        { kind: 'order', vi: 'x', answer: 'x', item: 'zz' },
                    ],
                },
            },
        ];
        expect(checkContentRefs(c)).toEqual([
            'lesson u2-l1 step 0 (INTRO): item a is not introduced by the lesson',
            'lesson u2-l1 step 1 (PRACTICE): item b is not linked to the lesson',
            'lesson u2-l1 step 2 (PATTERN_DRILL): c is not a PATTERN item',
            'lesson u2-l1 step 3 (PATTERN_DRILL): prompt 0 fills unknown slot age',
            'lesson u2-l1 step 4 (DIALOGUE): dialogue d is not in unit u2',
            'lesson u2-l1 step 5 (QUIZ): question 0 tests unknown item zz',
        ]);
    });

    it('checks checkpoint questions', () => {
        const c = valid();
        c.units[0].checkpoint = {
            slug: 'u1-cp',
            passPercent: 70,
            questions: [
                { kind: 'gap', sentence: '___', answers: ['x'], item: 'nope' },
            ],
        };
        expect(checkContentRefs(c)).toEqual([
            'checkpoint u1-cp: question 0 tests unknown item nope',
        ]);
    });
});
