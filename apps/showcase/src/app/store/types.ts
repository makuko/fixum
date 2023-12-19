import { $Array } from './array/$array';

export type Frozen<T> = T extends Array<infer I>
        ? readonly Frozen<I>[]
        : T extends object
            ? { readonly [P in keyof T]: Frozen<T[P]> }
            : T;

export type FrozenObject<T> = { readonly [P in keyof T]: Frozen<T[P]> };

export type FrozenArray<T> = readonly Frozen<T>[];

export type State = Record<string | number, any>;

export type Update<T> = T extends (infer I)[] | readonly (infer I)[]
    ? Update<I>[] | $Array<Update<I>>
    : T extends object
        ? { -readonly [P in keyof T]?: Update<T[P]> }
        : T;
