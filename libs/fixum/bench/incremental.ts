import { produce, setAutoFreeze } from 'immer';
import Immutable from 'immutable';

// import { Immutable as Fixum, lock, unlock } from '../src/app/store/immutable';
import { $Array } from '../src/lib/array/$array';
import { merge } from '../src/lib/merge';
import { measure } from './measure';

console.log('\n# incremental - lot of small incremental changes\n');

function createTestObject() {
	return {
		a: 1,
		b: 'Some data here'
	};
}

const MAX = 1000;
const baseState: { ids: number[], map: Record<number, object> } = {
	ids: [],
	map: Object.create(null)
};

const immutableJsBaseState = {
	ids: Immutable.List(),
	map: Immutable.Map()
};

measure(
	'just mutate',
	() => structuredClone(baseState),
	draft => {
		for (let i = 0; i < MAX; i++) {
			draft.ids.push(i);
			draft.map[i] = createTestObject();
		}
	}
);

measure(
	'handcrafted reducer',
	() => structuredClone(baseState),
	state => {
		for (let i = 0; i < MAX; i++) {
			state = {
				ids: [...state.ids, i],
				map: {
					...state.map,
					[i]: createTestObject()
				}
			};
		}
	}
);

measure(
	'immutableJS',
	() => immutableJsBaseState,
	state => {
		for (let i = 0; i < MAX; i++) {
			state = {
				ids: state.ids.push(i),
				map: state.map.set(i, createTestObject())
			};
		}
	}
);

measure(
	'immer',
	() => {
		setAutoFreeze(false);
		return baseState;
	},
	state => {
		for (let i = 0; i < MAX; i++) {
			state = produce(state, draft => {
				draft.ids.push(i);
				draft.map[i] = createTestObject();
			});
		}
	}
);

measure(
	'immer - single produce',
	() => {
		setAutoFreeze(false);
		return baseState;
	},
	state => {
		produce(state, draft => {
			for (let i = 0; i < MAX; i++) {
				draft.ids.push(i);
				draft.map[i] = createTestObject();
			}
		});
	}
);

// measure(
// 	'fixum - with proxy',
// 	() => Fixum(structuredClone(baseState)),
// 	state => {
// 		unlock(state);

// 		for (let i = 0; i < MAX; i++) {
// 			state.ids.push(i);
// 			state.map[i] = createTestObject();
// 		}

// 		lock(state);
// 	}
// );

measure(
	'fixum - with merge',
	() => merge(baseState, {}),
	state => {
		for (let i = 0; i < MAX; i++) {
			state = merge(
				state,
				{
					ids: $Array.push(i),
					map: {
						[i]: createTestObject()
					}
				}
			);
		}
	}
);

measure(
	'fixum - with single merge',
	() => merge(baseState, {}),
	state => {
		const ids = state.ids.slice();
		const map: Record<number, object> = {};

		for (let i = 0; i < MAX; i++) {
			ids.push(i);
			map[i] = createTestObject();
		}

		merge(state, { ids, map });
	}
);
