import { BcState, createBcTreeSlice } from './BcTree.ts'
import { VirtualFormActions, createVirtualFormSlice } from './VirtualForm.ts'
import { ModalState, createModalSlice } from './Modal.ts'
import { FilterActions, createFilterSlice } from './Filter.ts'

export type UnionState = BcState & VirtualFormActions & ModalState & FilterActions & {}

export { createBcTreeSlice, createModalSlice, createVirtualFormSlice, createFilterSlice }
