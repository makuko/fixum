import { State } from './types';

export function isObject(val: any): val is State {
    return val !== null && typeof val === 'object';
}
