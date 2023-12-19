import { MERGE, Mergable } from './mergable';

const { hasOwn } = Object;

export const DELETE = Symbol('delete');

export class $Array<T = any> extends Array<T> implements Mergable<T[]> {

    private operations: OperationFn<T>[] = [];

    constructor() {
        super();
    }

    public static $map<T>(callbackFn: (value: T, index: number, array: T[]) => T, thisArg?: any): $Array<T> {
        return new $Array().$map(callbackFn, thisArg);
    }

    public $set(index: number, value: T): this {
        this.operations.push((cur, next) => {
            next[index] = value;

            return next;
        });

        return this;
    }

    public $delete(index: number): this {
        this.operations.push((cur, next) => next.splice(index, 1));

        return this;
    }

    /**
     * Appends new elements to the end of an array, and returns the new length of the array.
     * 
     * @param items New elements to add to the array.
     */
    public $push(...items: T[]): this {
        this.operations.push((cur, next) => {
            next.push(...items);

            return next;
        });

        return this;
    }

    /**
     * Inserts new elements at the start of an array, and returns the new length of the array.
     * 
     * @param items Elements to insert at the start of the array.
     */
    public $unshift(...items: T[]): this {
        this.operations.push((cur, next) => {
            next.unshift(...items);

            return next;
        });

        return this;
    }



    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * 
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * 
     * @returns An array containing the elements that were deleted.
     */
    public $splice(start: number, deleteCount?: number): T[];

    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * 
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     * 
     * @returns An array containing the elements that were deleted.
     */
    public $splice(start: number, deleteCount: number, ...items: T[]): T[];

    // public $splice(start: number, deleteCount = Infinity, ...items: T[]): T[] {
    public $splice(...args: [number, number, ...T[]]): T[] {
        this.operations.push((cur, next) => next.splice(...args));

        return this;
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * 
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    public $filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * 
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    public $filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];

    public $filter(
        predicate: (value: T, index: number, array: T[]) => value is T,
        thisArg?: any
    ): this {
        // this.operations.push((cur, next) => {
        //     const res: T[] = [];

        //     for (let i = 0; i < next.length; i++) {
        //         const nextVal = hasOwn(next, i) ? next[i] : cur[i];

        //         if (predicate.call(thisArg, nextVal, i, next)) {
        //             res[i] = nextVal;
        //         }
        //     }

        //     return res;
        // });

        this.operations.push((cur, next) => next.filter(predicate, thisArg));

        return this;
    }

    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * 
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    public $sort(compareFn?: (a: T, b: T) => number): this {
        // this.operations.push((cur, next) => {
        //     for (let i = 0; i < next.length; i++) {
        //         if (!hasOwn(next, i)) {
        //             next[i] = cur[i];
        //         }
        //     }

        //     return next.sort(compareFn);
        // });

        this.operations.push((cur, next) => next.sort(compareFn));

        return this;
    }

    /**
     * Calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     * 
     * @param callbackfn
     * A function that accepts up to three arguments. The map method calls
     * the callbackfn function one time for each element in the array.
     * 
     * @param thisArg
     * An object to which the this keyword can refer in the callbackfn
     * function. If thisArg is omitted, undefined is used as the this value.
     */
    public $map(callbackFn: (value: T, index: number, array: T[]) => T, thisArg?: any): this {
        // this.operations.push((cur, next) => {
        //     for (let i = 0; i < next.length; i++) {
        //         const curVal = hasOwn(next, i) ? next[i] : cur[i];
        //         const nextVal = callbackFn.call(thisArg, curVal, i, next);

        //         if (nextVal !== curVal) {
        //             next[i] = nextVal;
        //         }
        //     }

        //     return next;
        // });

        this.operations.push((cur, next) => next.map(callbackFn, thisArg));

        return this;
    }

    public $reverse(): this {
        // this.operations.push((cur, next) => {
        //     let lo = 0; 
        //     let hi = next.length - 1; 

        //     while (lo < hi) {
        //         const loVal: T = hasOwn(next, lo) ? next[lo] : cur[lo];

        //         next[lo++] = hasOwn(next, hi) ? next[hi] : cur[hi];
        //         next[hi--] = loVal;
        //     }

        //     return next;
        // });

        this.operations.push((cur, next) => next.reverse());

        return this;
    }

    public [MERGE](cur: T[]): T[] {
        let next = [...cur];

        for (const operationFn of this.operations) {
            next = operationFn(cur, next);
        }

        return next;
    }

}

type OperationFn<T> = (current: T[], next: T[]) => T[];
