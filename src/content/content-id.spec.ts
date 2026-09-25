import { contentId, stepId, uuidv5 } from './content-id';

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('uuidv5', () => {
    it('matches the reference vector', () => {
        expect(uuidv5('www.example.com', DNS_NAMESPACE)).toBe(
            '2ed6657d-e927-568b-95e1-2665a8aea6a2',
        );
    });

    it('rejects a malformed namespace', () => {
        expect(() => uuidv5('x', 'not-a-uuid')).toThrow();
    });
});

describe('contentId', () => {
    it('is deterministic and a v5 UUID', () => {
        const id = contentId('item', 'hello');
        expect(contentId('item', 'hello')).toBe(id);
        expect(id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
    });

    it('separates kinds that share a slug', () => {
        expect(contentId('item', 'hello')).not.toBe(
            contentId('lesson', 'hello'),
        );
    });

    it('keys steps by lesson and position', () => {
        expect(stepId('l', 0)).toBe(contentId('step', 'l#0'));
        expect(stepId('l', 0)).not.toBe(stepId('l', 1));
    });
});
