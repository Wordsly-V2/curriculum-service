import { contentHash, stableStringify } from './content-hash';

describe('stableStringify', () => {
    it('sorts keys at every level and drops undefined', () => {
        expect(
            stableStringify({ b: 1, a: { d: [{ z: 1, y: 2 }], c: undefined } }),
        ).toBe('{"a":{"d":[{"y":2,"z":1}]},"b":1}');
    });

    it('keeps array order and turns undefined entries into null', () => {
        expect(stableStringify([2, undefined, 1])).toBe('[2,null,1]');
    });
});

describe('contentHash', () => {
    it('ignores key order', () => {
        expect(contentHash({ a: 1, b: 2 })).toBe(contentHash({ b: 2, a: 1 }));
    });

    it('changes with content', () => {
        expect(contentHash({ a: 1 })).not.toBe(contentHash({ a: 2 }));
    });
});
