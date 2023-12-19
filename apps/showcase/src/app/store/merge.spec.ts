import { merge } from './merge';

describe('merge', () => {
    it('should merge objects', () => {
        const dest = {
            a: {
                b: 1
            },
            c: {
                d: 2
            }
        };

        const src = {
            c: {
                d: 3
            }
        };

        const res = merge<typeof dest>(dest, src);

        expect(res).not.toBe(dest);
        expect(res.a).toBe(dest.a);
        expect(res.c).not.toBe(dest.c);
        expect(res.c).toEqual(src.c);
    });

    it('should handle circularity', () => {
        const dest = {
            a: {
                b: 1
            }
        };

        const a: any = { c: 1 };

        a.d = a;

        const src = { a };

        const res: any = merge(dest, src);

        expect(res.a).not.toBe(a);
        expect(res.a).toBe(res.a.d);
    });
});
