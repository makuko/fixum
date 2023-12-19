import { FrozenArray } from './frozen';
import { MUTATE, Mutation } from './mutation';
import { Update } from './update';

export class $Array<T = any> extends Mutation<T[]> {

    private operations: OperationFn<T>[] = [];

    /**
     * Updates an element in the array.
     * 
     * @param index
     * The zero-based location in the array that will be updated.
     * 
     * @param value
     * The new value that will be set.
     */
    public static set<T>(index: number, value: Update<T>): $Array<T> {
        return new $Array().set(index, value);
    }

    /**
     * Appends new elements to the end of an array.
     * 
     * @param items
     * New elements to add to the array.
     */
    public static push<T>(...items: Update<T>[]): $Array<T> {
        return new $Array().push(...items);
    }

    /**
     * Inserts new elements at the start of an array.
     * 
     * @param items
     * Elements to insert at the start of the array.
     */
    public static unshift<T>(...items: Update<T>[]): $Array<T> {
        return new $Array().unshift(...items);
    }

    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place.
     * 
     * @param start
     * The zero-based location in the array from which to start removing elements.
     * 
     * @param deleteCount
     * The number of elements to remove.
     * 
     * @param items
     * Elements to insert into the array in place of the deleted elements.
     */
    public static splice<T>(start: number, deleteCount?: number, ...items: Update<T>[]): $Array<T>;
    public static splice<T>(...args: [number]): $Array<T> {
        return new $Array().splice(...args);
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * 
     * @param predicate
     * A function that accepts up to three arguments. The filter method calls the
     * predicate function one time for each element in the array.
     * 
     * @param thisArg
     * An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    public static filter<T>(
        predicate: (value: Update<T>, index: number, array: Update<T>[]) => unknown,
        thisArg?: any
    ): $Array<T> {
        return new $Array().filter(predicate, thisArg);
    }

    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * 
     * @param compareFn
     * Function used to determine the order of the elements. It is expected to return a negative value
     * if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     * 
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    public static sort<T>(compareFn?: (a: Update<T>, b: Update<T>) => number): $Array<T> {
        return new $Array().sort(compareFn);
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
    public static map<T>(
        callbackFn: (value: Update<T>, index: number, array: Update<T>[]) => Update<T>,
        thisArg?: any
    ): $Array<T> {
        return new $Array<T>().map(callbackFn, thisArg);
    }

    /**
     * Reverses the elements in an array in place. This method mutates the
     * array and returns a reference to the same array.
     */
    public static reverse<T>(): $Array<T> {
        return new $Array().reverse();
    }

    /**
     * Updates an element in the array.
     * 
     * @param index
     * The zero-based location in the array that will be updated.
     * 
     * @param value
     * The new value that will be set.
     */
    public set(index: number, value: Update<T>): this {
        this.operations.push(next => {
            next[index] = value;

            return next;
        });

        return this;
    }

    /**
     * Appends new elements to the end of an array.
     * 
     * @param items
     * New elements to add to the array.
     */
    public push(...items: Update<T>[]): this {
        this.operations.push(next => {
            next.push(...items);

            return next;
        });

        return this;
    }

    /**
     * Inserts new elements at the start of an array.
     * 
     * @param items
     * Elements to insert at the start of the array.
     */
    public unshift(...items: Update<T>[]): this {
        this.operations.push(next => {
            next.unshift(...items);

            return next;
        });

        return this;
    }

    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place.
     * 
     * @param start
     * The zero-based location in the array from which to start removing elements.
     * 
     * @param deleteCount
     * The number of elements to remove.
     * 
     * @param items
     * Elements to insert into the array in place of the deleted elements.
     */
    public splice(start: number, deleteCount?: number, ...items: Update<T>[]): this;
    public splice(...args: [number]): this {
        this.operations.push(next => next.splice(...args));

        return this;
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * 
     * @param predicate
     * A function that accepts up to three arguments. The filter method calls the
     * predicate function one time for each element in the array.
     * 
     * @param thisArg
     * An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    public filter(predicate: (value: Update<T>, index: number, array: Update<T>[]) => unknown, thisArg?: any): this {
        this.operations.push(next => next.filter(predicate, thisArg));

        return this;
    }

    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * 
     * @param compareFn
     * Function used to determine the order of the elements. It is expected to return a negative value
     * if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     * 
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    public sort(compareFn?: (a: Update<T>, b: Update<T>) => number): this {
        this.operations.push(next => next.sort(compareFn));

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
    public map(callbackFn: (value: Update<T>, index: number, array: Update<T>[]) => Update<T>, thisArg?: any): this {
        this.operations.push(next => next.map(callbackFn, thisArg));

        return this;
    }

    /**
     * Reverses the elements in an array in place. This method mutates the
     * array and returns a reference to the same array.
     */
    public reverse(): this {
        this.operations.push(next => next.reverse());

        return this;
    }

    protected [MUTATE](cur: FrozenArray<T>): Update<T>[] {
        let next = [...cur] as Update<T>[];

        for (const operationFn of this.operations) {
            next = operationFn(next);
        }

        return next;
    }

}

type OperationFn<T> = (next: Update<T>[]) => Update<T>[];
