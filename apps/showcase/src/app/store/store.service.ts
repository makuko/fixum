import { signal, computed, WritableSignal, Signal } from '@angular/core';

import { deepFreeze } from './deep-freeze';
import { merge } from './merge';
import { Frozen, State, Update } from './types';

export class Store<T extends State> {

    private state: WritableSignal<Frozen<T>>;

    constructor(initialState: T) {
        this.state = signal(deepFreeze(initialState));
    }

    protected update(updateFn: (state: Frozen<T>) => Update<T>) {
        this.state.update(
            state => merge(state, updateFn(state))
        );
    }

    protected select<R>(queryFn: (state: Frozen<T>) => R): Signal<R> {
        return computed(
            () => queryFn(this.state())
        );
    }

}
