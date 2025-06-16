import { BcState, createBcTreeSlice } from './BcTree.ts'
import { MutationDraftActions, createMutationSlice } from './MutationDraft.ts'
import { ModalState, createModalSlice } from './Modal.ts'
import { FilterActions, createFilterSlice } from './Filter.ts'

export type UnionState = BcState & MutationDraftActions & ModalState & FilterActions & {}

export { createBcTreeSlice, createModalSlice, createMutationSlice, createFilterSlice }
