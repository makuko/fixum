export type Frozen<T> = T extends Array<infer I> | ReadonlyArray<infer I>
    ? I[] extends T // Check for tuples
        ? readonly Frozen<I>[]
        : T extends [infer F, ...infer R]
            ? [Frozen<F>, ...Frozen<R>]
            : []
    : T extends Set<infer I> | ReadonlySet<infer I>
        ? Set<Frozen<I>>
        : T extends Map<infer K, infer V> | ReadonlyMap<infer K, infer V>
            ? Map<Frozen<K>, Frozen<V>>
            : T extends ((...args: any[]) => any)
				// ? T | undefined
                ? never
                : T extends Date | RegExp | ArrayBufferView | ArrayBuffer
                    ? T
                    : T extends object
                        ? { readonly [P in keyof T]: Frozen<T[P]> }
                        : T;

export type FrozenObject<T> = { readonly [P in keyof T]: Frozen<T[P]> };

export type FrozenArray<T> = readonly Frozen<T>[];
