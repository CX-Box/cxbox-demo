/* eslint-disable react-hooks/rules-of-hooks */
import { createStore, StateCreator, useStore as useStoreHook } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UnionState } from './slices'

export class Store<US extends UnionState> {
    private readonly _store

    constructor(sliceCreators: Array<StateCreator<US, [], [], Partial<US>>>) {
        this._store = createStore<US>()(
            devtools((...a) => {
                let record = {} as US
                for (const creator of sliceCreators) {
                    record = { ...record, ...creator(...a) }
                }
                return record
            })
        )
    }

    useStore<T>(selector?: (state: US) => T): T {
        return useStoreHook(this._store, selector!)
    }

    getState() {
        return this._store.getState()
    }
}
