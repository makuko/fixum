import { Frozen } from './frozen';
import { Update } from './update';

export const MUTATE = Symbol('mutate');

export abstract class Mutation<T> {
    protected abstract [MUTATE](current: Frozen<T>): Update<T>;
}
