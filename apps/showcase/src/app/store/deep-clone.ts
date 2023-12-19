export function deepClone<T>(src: T, stack: Map<object, object> = new Map()): T {
    if (src === null || typeof src !== 'object') {
        return src;
    }

    // Date
    if (src instanceof Date) {
        return new Date(src.getTime()) as T;
    }

    // RegExp
    if (src instanceof RegExp) {
        return new RegExp(src) as T;
    }

    // DOM Element
    if (src instanceof Node) {
        return src.cloneNode(true) as T;
    }

    // Check if this object has already been visited.
    if (stack.has(src)) {
        return stack.get(src) as T;
    }

    // Array
    if (Array.isArray(src)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arr: any[] = [];

        // Add it to the visited array.
        stack.set(src, arr);

        for (const item of src) {
            arr.push(deepClone(item, stack));
        }

        stack.delete(src);

        return Object.freeze(arr) as T;
    }

    // Object

    // Make sure the returned object has the same prototype as the original.
    const obj: T & object = Object.create(Object.getPrototypeOf(src));

    // Add it to the visited array.
    stack.set(src, obj);

    const descriptors = Object.getOwnPropertyDescriptors(src);

    for (const key in descriptors) {
        if (!Object.prototype.hasOwnProperty.call(descriptors, key)) {
            continue;
        }

        const srcDescriptor = descriptors[key];
        const objDescriptor: PropertyDescriptor = {
            writable: srcDescriptor.writable,
            configurable: srcDescriptor.configurable,
            enumerable: srcDescriptor.enumerable
        };

        if (srcDescriptor.get) {
            objDescriptor.get = deepClone(srcDescriptor.get, stack);
        }

        if (srcDescriptor.set) {
            objDescriptor.set = deepClone(srcDescriptor.set, stack);
        }

        if (srcDescriptor.value) {
            objDescriptor.value = deepClone(srcDescriptor.value, stack);
        }

        Object.defineProperty(obj, key, objDescriptor);
    }

    stack.delete(src);

    return Object.freeze(obj);
}
