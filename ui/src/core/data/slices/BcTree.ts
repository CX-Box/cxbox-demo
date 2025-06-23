import { StateCreator } from 'zustand'
import { UnionState } from './index.ts'
import { produce } from 'immer'
import { DataItem, DataValue } from '../../contract/data'
import { FilterGroup, FilterType } from '../../contract/common'

/**
 * Field mutation state
 * Represents current input value and additional parameters
 */
interface FieldState {
    /**
     * Current field value
     */
    value: DataValue
    /**
     * true, after the field value has been changed
     */
    isDirty: boolean
    /**
     * true, until the user changes the field value
     */
    isPristine: boolean
    /**
     * true, after the user clicks/tabs into the field
     */
    isTouched: boolean
    /**
     * true, after the field has been blurred
     */
    isBlurred: boolean
}

interface FieldsMutationRecord {
    [fieldName: string]: FieldState
}

interface VirtualFormState {
    defaultValues: DataItem
    fields: FieldsMutationRecord
}

interface VirtualFormRecord {
    [cursor: string]: VirtualFormState
}

export interface Filter {
    type: FilterType | (string & {})
    fieldKey: string
    value: string
}

export interface Sorter {
    fieldName: string
    direction: 'asc' | 'desc'
}

interface Pagination {
    page: number
    limit?: number
}

interface BusinessComponent {
    parentName: string | null
    name: string
    cursor: string | null
    defaultSort?: string
    filterGroups?: FilterGroup[]
    defaultFilter?: string
    virtualForms: VirtualFormRecord
    filters: Filter[]
    sorters: Sorter[]
    pagination: Pagination
}

type BcTree = Array<BusinessComponent>

export interface BcState {
    /**
     * State for current BcTree, always resets when screen changes
     */
    bcTree: BcTree
    /**
     * Sets clear bc tree with null cursors except cursors from url
     * @param bcTree slice from app meta
     */
    setInitialBcTree: (bcTree: BcTree) => void
    /**
     * Merge existing bc tree without resetting cursors and filters
     * @param bcTree slice from app meta
     */
    mergeBcTree: (bcTree: BcTree) => void
    /**
     * Sets bc cursors with nullification of ancestors
     * @param bcTree
     */
    setBcCursor: (bcName: string, cursor: string | null) => void
}

export const createBcTreeSlice: StateCreator<UnionState, [['zustand/devtools', never]], [], BcState> = set => ({
    bcTree: [],
    setInitialBcTree: bcTree => set(() => ({ bcTree: bcTree }), undefined, 'bcTree/setInitialBcTree'),
    mergeBcTree: bcTree =>
        set(
            produce((state: UnionState) => {
                bcTree.forEach(bc => {
                    const thisBc = state.bcTree.find(sBc => sBc.name === bc.name)
                    if (thisBc) {
                        thisBc.cursor = bc.cursor
                    }
                })
            }),
            undefined,
            'bcTree/mergeBcTree'
        ),
    setBcCursor: (bcName, cursor) =>
        set(
            produce((state: BcState) => {
                const currentBc = state.bcTree.find(val => val.name === bcName)
                if (currentBc) {
                    currentBc.cursor = cursor
                    recursiveNullifyChildrenCursors(currentBc.name)
                }

                function recursiveNullifyChildrenCursors(parentBcName: string) {
                    const children = state.bcTree.filter(child => child.parentName === parentBcName)

                    children?.forEach(child => {
                        child.cursor = null
                        recursiveNullifyChildrenCursors(child.name)
                    })
                }
            }),
            undefined,
            'bcTree/setBcCursor'
        )
})
