const proxies = new WeakMap<object, object>();

const locks = new WeakMap<object, boolean>();

const parents = new WeakMap<object, Set<object>>();

const handler: ProxyHandler<any> = {
    get(target: any, propertyKey: string | symbol): any {
        return Immutable(target[propertyKey], target, locks.get(proxies.get(target)!));
    },
    set(target: any, propertyKey: string | symbol, value: any): boolean {
        if (locks.get(proxies.get(target)!)) {
            return false;
        }

        unset(target);

        target[propertyKey] = value;

        return true;
    },
    deleteProperty(target: any, p: string | symbol): boolean {
        if (locks.get(proxies.get(target)!)) {
            return false;
        }

        unset(target);

        delete target[p];

        return true;
    }
};

export function Immutable<T>(target: T, parent?: object, isLocked = true): T {
    if (!isObject(target)) {
        return target;
    }

    let proxy = proxies.get(target) as T & object;

    if (!proxy) {
        proxies.set(target, proxy = new Proxy(target, handler));
    }

    locks.set(proxy, isLocked);

    if (parent) {
        let parentSet = parents.get(target) as Set<object>;

        if (!parentSet) {
            parents.set(target, parentSet = new Set());
        }

        parentSet.add(parent);
    }

    return proxy;
}

export function lock<T>(proxy: T): void {
    isObject(proxy) && locks.set(proxy, true);
}

export function unlock<T>(proxy: T): void {
    isObject(proxy) && locks.set(proxy, false);
}

function isObject<T>(target: T): target is object & T {
    return target !== null && typeof target === 'object';
}

function unset(target: object): void {
    proxies.delete(target);

    const parentSet = parents.get(target);

    if (!parentSet) {
        return;
    }

    for (const parent of parentSet) {
        unset(parent);
    }
}
