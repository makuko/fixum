import type { $Array } from './$array';

export type Update<T> = T extends Array<infer I> | ReadonlyArray<infer I>
    ? I[] extends T // Check for tuples
        ? Update<I>[] | $Array<I>
        : T extends [infer F, ...infer R]
            ? [Update<F>, ...Update<R>]
            : []
    : T extends Set<infer I> | ReadonlySet<infer I>
        ? Set<Update<I>>
        : T extends Map<infer K, infer V> | ReadonlyMap<infer K, infer V>
            ? Map<Update<K>, Update<V>>
            : T extends ((...args: any[]) => any)
				// ? T | undefined
                ? never
                : T extends Date | RegExp | ArrayBufferView | ArrayBuffer
                    ? T
                    : T extends object
                        ? { -readonly [P in keyof T]?: Update<T[P]> }
                        : T;
