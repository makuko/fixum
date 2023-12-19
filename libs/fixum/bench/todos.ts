import { enablePatches, produce, setAutoFreeze } from 'immer';
import immutable from 'immutable';
import { Bench } from 'tinybench';

import { $Array } from '../src/lib/$array';
import { deepFreeze } from '../src/lib/deep-freeze';
import { merge } from '../src/lib/merge';

const { List, Record } = immutable;

const { freeze } = Object;

const MAX = 50000;
const MODIFY_FACTOR = 0.1;

interface Todo {
    todo: string;
    done: boolean;
    someThingCompletelyIrrelevant: number[];
}

const baseState: Todo[] = [];

// produce the base state
for (let i = 0; i < MAX; i++) {
    baseState.push({
        todo: 'todo_' + i,
        done: false,
        someThingCompletelyIrrelevant: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    });
}

// Produce the frozen bazeState
const frozenBazeState = deepFreeze(structuredClone(baseState));

// generate immutalbeJS base state
const todoRecord = Record<Todo>({
    todo: '',
    done: false,
    someThingCompletelyIrrelevant: []
});

const immutableJsBaseState = List(baseState.map(todo => todoRecord(todo)));

const bench = new Bench({ time: 100 });

let nextState: Todo[];

bench
    // .add(
    //     'just mutate',
    //     () => {
    //         for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    //             nextState[i].done = true;
    //         }
    //     },
    //     {
    //         beforeEach() {
    //             nextState = structuredClone(baseState);
    //         }
    //     }
    // )
    .add(
        'mutate, then freeze',
        () => {
            for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                nextState[i].done = true;
            }

            deepFreeze(nextState);
        },
        {
            beforeEach() {
                nextState = structuredClone(baseState);
            }
        }
    )
    .add(
        'deepclone, then mutate',
        () => {
            const nextState = structuredClone(baseState);

            for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                nextState[i].done = true;
            }
        }
    )
    .add(
        'deepclone, then mutate, then freeze',
        () => {
            const nextState = structuredClone(baseState);

            for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                nextState[i].done = true;
            }

            deepFreeze(nextState);
        }
    )
    .add(
        'handcrafted reducer',
        () => {
            const nextState = [
                ...baseState.slice(0, MAX * MODIFY_FACTOR).map(todo => ({
                    ...todo,
                    done: true
                })),
                ...baseState.slice(MAX * MODIFY_FACTOR)
            ];
        }
    )
    .add(
        'handcrafted reducer, then freeze',
        () => {
            const nextState = freeze([
                ...baseState.slice(0, MAX * MODIFY_FACTOR).map(todo =>
                    freeze({
                        ...todo,
                        done: true
                    })
                ),
                ...baseState.slice(MAX * MODIFY_FACTOR)
            ]);
        }
    )
    .add(
        'naive handcrafted reducer',
        () => {
            const nextState = baseState.map((todo, index) => {
                if (index < MAX * MODIFY_FACTOR) {
                    return {
                        ...todo,
                        done: true
                    };
                }

                return todo;
            });
        }
    )
    .add(
        'naive handcrafted reducer, then freeze',
        () => {
            const nextState = deepFreeze(
                baseState.map((todo, index) => {
                    if (index < MAX * MODIFY_FACTOR) {
                        return {
                            ...todo,
                            done: true
                        };
                    }

                    return todo;
                })
            );
        }
    )
    .add(
        'immutableJS',
        () => {
            const nextState = immutableJsBaseState
                .withMutations(state => {
                    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                        state.setIn([i, 'done'], true);
                    }
                });
        }
    )
    .add(
        'immutableJS + toJS',
        () => {
            const nextState = immutableJsBaseState
                .withMutations(state => {
                    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                        state.setIn([i, 'done'], true);
                    }
                })
                .toJS();
        }
    )
    .add(
        'immer - without autofreeze',
        () => {
            const nextState = produce(baseState, draft => {
                for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                    draft[i].done = true;
                }
            });
        },
        {
            beforeAll() {
                setAutoFreeze(false);
            }
        }
    )
    .add(
        'immer - with autofreeze',
        () => {
            const nextState = produce(frozenBazeState, draft => {
                for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                    draft[i].done = true;
                }
            });
        },
        {
            beforeAll() {
                setAutoFreeze(true);
            }
        }
    )
    .add(
        'immer - without autofreeze - with patch listener',
        () => {
            const nextState = produce(
                baseState,
                draft => {
                    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                        draft[i].done = true;
                    }
                },
                function () { /**/ }
            );
        },
        {
            beforeAll() {
                enablePatches();
                setAutoFreeze(false);
            }
        }
    )
    .add(
        'immer - with autofreeze - with patch listener',
        () => {
            const nextState = produce(
                frozenBazeState,
                draft => {
                    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                        draft[i].done = true;
                    }
                },
                function () { /**/ }
            );
        },
        {
            beforeAll() {
                enablePatches();
                setAutoFreeze(true);
            }
        }
    )
    .add(
        'fixum - with map',
        () => {
            const nextState = merge(
                frozenBazeState,
                $Array.map(
                    (todo, index) => index < MAX * MODIFY_FACTOR ? { done: true } : todo
                )
            );
        }
    )
    .add(
        'fixum - with set',
        () => {
            const mutation = new $Array<Todo>();

            for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
                mutation.set(i, { done: true });
            }

            const nextState = merge<Todo[]>(frozenBazeState, mutation);
        }
    );

bench
    .run()
    .then(() => console.table(bench.table()));
