import { isObject } from './is-object';
import { Frozen } from './frozen';

const { freeze, getOwnPropertyNames, isFrozen } = Object;

export function deepFreeze<T extends Record<string | number, any>>(obj: T): Frozen<T> {
    for (const property of getOwnPropertyNames(obj) as (keyof T)[]) {
        const value = obj[property];

        if (
            isObject(value)
            && !isFrozen(value)
        ) {
            deepFreeze(value);
        }
    }

    return freeze(obj) as Frozen<T>;
}
