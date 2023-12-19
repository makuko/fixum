export function isObject(val: any): val is Record<string | number, any> {
    return val !== null && typeof val === 'object';
}
