import { MUTATE, Mutation } from './mutation';
import { isObject } from './is-object';
import { Frozen, FrozenArray, FrozenObject } from './frozen';
import { Update } from './update';

const { create, freeze, getOwnPropertyNames, getPrototypeOf, hasOwn } = Object;
const { isArray } = Array;

export function merge<T extends object>(dest: Frozen<T>, src: Update<T>): Frozen<T> {
    return mergeObject(dest, src, new Map());
}

function mergeObject<T extends object>(dest: Frozen<T>, src: Update<T> & Partial<Mutation<T>>, stack: Stack): Frozen<T> {
    if (stack.has(src)) {
        return stack.get(src) as Frozen<T>;
    }

    if (src instanceof Mutation) {
        src = src[MUTATE](dest);
    }

    if (src instanceof ArrayBuffer) {
        return (src === dest ? src : src.slice(0)) as Frozen<T>;
    }

    if (ArrayBuffer.isView(src)) {
        return mergeView(dest, src) as Frozen<T>;
    }

    if (isArray(src)) {
        return mergeArray(isArray(dest) ? dest : [], src, stack);
    }

    return mergePlainObject<T>(dest as FrozenObject<T>, src, stack);
}

function mergeArray<T>(dest: FrozenArray<T>, src: T[], stack: Stack): Frozen<T> {
    const arr: T[] = [];

    stack.set(src, arr);

    for (const [i, item] of src.entries()) {
        arr.push(
            hasOwn(src, i) && dest[i] !== src[i]
                ? mergeAny(dest[i], item, stack)
                : dest[i]
        );
    }

    stack.delete(src);

    return freeze(arr) as Frozen<T>;
}

function mergeView<T extends ArrayBufferView>(dest: any, src: T): Frozen<T> {
    if (src === dest) {
        return src as Frozen<T>;
    }

    const Ctor = getPrototypeOf(src).constructor;

    return new Ctor(src.buffer.slice(0));
}

function mergePlainObject<T extends Record<string | number, any>>(dest: FrozenObject<T>, src: Update<T>, stack: Stack): Frozen<T> {
    const obj: T = create(getPrototypeOf(dest));

    for (const key of getOwnPropertyNames(dest) as (keyof T)[]) {
        obj[key] = dest[key];
    }

    stack.set(src, obj);

    for (const key of getOwnPropertyNames(src) as (keyof T)[]) {
        obj[key] = mergeAny(
            hasOwn(dest, key) ? dest[key] : undefined,
            src[key as keyof Update<T>],
            stack
        );
    }

    stack.delete(src);

    return freeze(obj) as Frozen<T>;
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

    return mergeObject(isObject(dest) ? dest : {}, src, stack);
}

export type Stack = Map<object, object>;
