import { itemSchema, questionSchema, stepSchema } from './content.schema';

const base = { slug: 'x', text: 'x', meaningVi: 'x', examples: [] };

describe('itemSchema', () => {
    it('requires pattern on PATTERN items and rejects it elsewhere', () => {
        expect(itemSchema.safeParse({ ...base, type: 'PATTERN' }).success).toBe(
            false,
        );
        expect(
            itemSchema.safeParse({
                ...base,
                type: 'LEXICAL',
                pattern: {
                    template: 'I {a}',
                    slots: [{ name: 'a', hintVi: 'x', options: ['x'] }],
                },
            }).success,
        ).toBe(false);
    });

    it('requires template placeholders and slots to match', () => {
        const item = (template: string) => ({
            ...base,
            type: 'PATTERN',
            pattern: {
                template,
                slots: [{ name: 'thing', hintVi: 'x', options: ['tea'] }],
            },
        });
        expect(itemSchema.safeParse(item("I'd like {thing}.")).success).toBe(
            true,
        );
        expect(itemSchema.safeParse(item("I'd like {drink}.")).success).toBe(
            false,
        );
    });

    it('rejects unknown keys and bad slugs', () => {
        expect(
            itemSchema.safeParse({ ...base, type: 'LEXICAL', extra: 1 })
                .success,
        ).toBe(false);
        expect(
            itemSchema.safeParse({ ...base, slug: 'Bad Slug', type: 'LEXICAL' })
                .success,
        ).toBe(false);
    });

    it('requires an example highlight to appear in the sentence', () => {
        const withExample = (highlight: string) => ({
            ...base,
            type: 'LEXICAL',
            examples: [{ en: 'Hello, Lan!', vi: 'Chào Lan!', highlight }],
        });
        expect(itemSchema.safeParse(withExample('hello')).success).toBe(true);
        expect(itemSchema.safeParse(withExample('bye')).success).toBe(false);
    });
});

describe('questionSchema', () => {
    it('checks the answer index', () => {
        const q = (answer: number) => ({
            kind: 'choice',
            prompt: 'p',
            options: ['a', 'b'],
            answer,
        });
        expect(questionSchema.safeParse(q(1)).success).toBe(true);
        expect(questionSchema.safeParse(q(2)).success).toBe(false);
    });

    it('needs exactly one gap', () => {
        const q = (sentence: string) => ({
            kind: 'gap',
            sentence,
            answers: ['x'],
        });
        expect(questionSchema.safeParse(q('My ___ is Lan.')).success).toBe(
            true,
        );
        expect(questionSchema.safeParse(q('My name is Lan.')).success).toBe(
            false,
        );
        expect(questionSchema.safeParse(q('___ ___')).success).toBe(false);
    });
});

describe('stepSchema', () => {
    it('validates the payload of its type and requires schemaVersion 1', () => {
        expect(
            stepSchema.safeParse({
                type: 'INTRO',
                payload: { schemaVersion: 1, items: ['a'] },
            }).success,
        ).toBe(true);
        expect(
            stepSchema.safeParse({
                type: 'INTRO',
                payload: { schemaVersion: 2, items: ['a'] },
            }).success,
        ).toBe(false);
        expect(
            stepSchema.safeParse({
                type: 'WARMUP',
                payload: { schemaVersion: 1, items: ['a'] },
            }).success,
        ).toBe(false);
    });
});
