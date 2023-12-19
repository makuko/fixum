import { MERGE } from './array/mergable';
import { isObject } from './is-object';
import { Frozen, FrozenArray, FrozenObject, State, Update } from './types';

const { create, freeze, getOwnPropertyNames, getPrototypeOf, hasOwn } = Object;
const { isArray } = Array;

export function merge<T extends State>(dest: Frozen<T>, src: Update<T>): Frozen<T> {
    return mergeObject(dest, src, new Map());
}

function mergeObject<T extends State>(dest: Frozen<T>, src: Update<T>, stack: Stack): Frozen<T> {
    if (stack.has(src)) {
        return stack.get(src) as Frozen<T>;
    }

    if (typeof (src as any)[MERGE] === 'function') {
        src = (src as any)[MERGE](dest);
    }

    if (isArray(src)) {
        return mergeArray(isArray(dest) ? dest : [], src, stack) as Frozen<T>;
    }

    return mergePlainObject<T>(dest as FrozenObject<T>, src, stack) as Frozen<T>;
}

function mergeArray<T>(dest: FrozenArray<T>, src: T[], stack: Stack): FrozenArray<T> {
    const arr: T[] = [];

    stack.set(src, arr);

    for (const [i, item] of src.entries()) {
        arr.push(
            hasOwn(src, i) && dest[i] !== src[i] ? mergeAny(dest[i], item, stack) : dest[i]
        );
    }

    stack.delete(src);

    return freeze(arr) as FrozenArray<T>;
}

function mergePlainObject<T extends State>(dest: FrozenObject<T>, src: Update<T>, stack: Stack): FrozenObject<T> {
    const obj: T = create(getPrototypeOf(dest));

    for (const key of getOwnPropertyNames(dest) as (keyof T)[]) {
        obj[key] = dest[key];
    }

    stack.set(src, obj);

    for (const key of getOwnPropertyNames(src) as (keyof T)[]) {
        obj[key] = mergeAny(
            hasOwn(dest, key) ? dest[key] : undefined,
            src[key as any],
            stack
        );
    }

    stack.delete(src);

    return freeze(obj) as FrozenObject<T>;
}

export function mergeAny<T>(dest: any, src: any, stack: Stack): any {
    if (!isObject(src)) {
        return src;
    }

    if (src instanceof Date) {
        return new Date(src.getTime());
    }

    if (src instanceof RegExp) {
        return new RegExp(src);
    }

    // if (src instanceof Node) {
    //     return src.cloneNode(true);
    // }

    // TODO: TypedArrays

    return mergeObject(isObject(dest) ? dest : {}, src, stack);
}

export type Stack = Map<object, object>;
