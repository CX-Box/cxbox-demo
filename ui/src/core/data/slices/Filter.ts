import { StateCreator } from 'zustand'
import { UnionState } from './index.ts'
import { produce } from 'immer'
import { Filter } from './BcTree.ts'

export interface FilterActions {
    setBcFilter: (bcName: string, filter: Filter) => void
    resetBcFilter: (bcName: string, fieldKey: string) => void
    resetBcAllFilters: (bcName: string) => void
}

export const createFilterSlice: StateCreator<UnionState, [['zustand/devtools', never]], [], FilterActions> = set => ({
    setBcFilter: (bcName, filter) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    const filterIndex = bc?.filters.findIndex(f => f.fieldKey === filter.fieldKey)
                    if (filterIndex === -1) {
                        bc.filters.push(filter)
                    } else {
                        bc.filters[filterIndex] = filter
                    }
                }
            }),
            undefined,
            'filter/setBcFilter'
        ),
    resetBcFilter: (bcName, fieldKey) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    const removeIndex = bc?.filters.findIndex(f => f.fieldKey === fieldKey)
                    bc.filters.splice(removeIndex, 1)
                }
            }),
            undefined,
            'filter/resetBcFilter'
        ),
    resetBcAllFilters: () => set(state => state)
})
