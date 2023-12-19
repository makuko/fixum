export const MERGE = Symbol('merge');

export interface Mergable<T> {
    [MERGE]: (current: T) => T;
}
