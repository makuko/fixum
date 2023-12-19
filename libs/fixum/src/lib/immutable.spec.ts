import { Immutable, lock, unlock } from './immutable';

fdescribe('Immutable', () => {
    it('should make objects immutable', () => {
        const mutable = {
            a: {
                b: 1
            },
            c: {
                d: 2
            }
        };

        const immutable = Immutable(mutable);
        const a = immutable.a;

        expect(immutable).not.toBe(mutable);
        expect(a).not.toBe(mutable.a);
        expect(immutable).toBe(Immutable(mutable));
        expect(() => immutable.a.b = 3).toThrowError();

        unlock(immutable);

        expect(() => immutable.a.b = 3).not.toThrowError();

        // lock(immutable);

        expect(immutable).not.toBe(Immutable(mutable));
        expect(a).not.toBe(Immutable(mutable).a);
    });
});
