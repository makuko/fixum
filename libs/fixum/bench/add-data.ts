import { produce, setAutoFreeze } from 'immer';
import immutable from 'immutable';

// import { Immutable as Fixum, lock, unlock } from '../src/app/store/immutable';
import { merge } from '../src/lib/merge';
import { deepFreeze } from '../src/lib/deep-freeze';
import { measure } from './measure';

console.log('\n# add-data - loading large set of data\n')

import dataSet from './data.json';

const { fromJS } = immutable;

const baseState:  { data: any } = { data: null };
const frozenBazeState = deepFreeze(structuredClone(baseState));
const immutableJsBaseState = fromJS(baseState);
const MAX = 10000;

measure(
    'just mutate',
    () => ({ draft: structuredClone(baseState) }),
    ({ draft }) => {
        draft.data = dataSet
    }
);

measure(
    'just mutate, freeze',
    () => ({ draft: structuredClone(baseState) }),
    ({ draft }) => {
        draft.data = dataSet
        deepFreeze(draft)
    }
);

measure('handcrafted reducer (no freeze)', () => {
    const nextState = {
        ...baseState,
        data: dataSet
    };
});

measure('handcrafted reducer (with freeze)', () => {
    const nextState = deepFreeze({
        ...baseState,
        data: dataSet
    });
});

measure('immutableJS', () => {
    const state = immutableJsBaseState.withMutations(state => {
        state.setIn(['data'], fromJS(dataSet));
    });
});

measure('immutableJS + toJS', () => {
    const state = immutableJsBaseState
        .withMutations(state => {
            state.setIn(['data'], fromJS(dataSet));
        })
        .toJS();
});

measure('immer - without autofreeze * ' + MAX, () => {
    setAutoFreeze(false);

    for (let i = 0; i < MAX; i++) {
        produce(baseState, draft => {
            draft.data = dataSet;
        });
    }
});

measure('immer - with autofreeze * ' + MAX, () => {
    setAutoFreeze(true);

    for (let i = 0; i < MAX; i++) {
        produce(frozenBazeState, draft => {
            draft.data = dataSet;
        });
    }
});

// measure(
//     'fixum - with proxy',
//     () => ({ state: Fixum(structuredClone(baseState)), dataSet: structuredClone(dataSet) }),
//     ({ state, dataSet }) => {
//         unlock(state);

//         state.data = dataSet;

//         lock(state);
//     }
// );

measure(
    'fixum - with merge',
    () => {
        merge(
            frozenBazeState,
            {
                data: dataSet
            }
        );
    }
);
