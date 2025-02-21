import { RootState } from '@store'
import { PendingValidationFails } from '@cxbox-ui/core'

export const selectBc = (state: RootState, bcName: string | undefined) => (bcName ? state.screen.bo.bc?.[bcName] : undefined)

export const selectBcRecordForm = (state: RootState, bcName: string | undefined) => (bcName ? state.view.recordForm?.[bcName] : undefined)

export const selectBcData = (state: RootState, bcName: string | undefined) => (bcName ? state.data[bcName] : undefined)

export const selectBcRowMeta = (state: RootState, bcName: string | undefined) => (bcName ? state.view.rowMeta?.[bcName] : undefined)

export const selectBcMetaInProgress = (state: RootState, bcName: string | undefined) =>
    bcName ? state.view.metaInProgress?.[bcName] : undefined

export const selectBcPendingDataChanges = (state: RootState, bcName: string | undefined) =>
    bcName ? state.view.pendingDataChanges?.[bcName] : undefined

export const selectBcRecordPendingDataChanges = (state: RootState, bcName: string | undefined, cursor: string | null | undefined) =>
    bcName && cursor ? state.view.pendingDataChanges?.[bcName]?.[cursor] : undefined

export const selectBcPendingValidationFails = (state: RootState, bcName: string | undefined) =>
    bcName ? (state.view.pendingValidationFails as PendingValidationFails)?.[bcName] : undefined

export const selectBcFilters = (state: RootState, bcName: string | undefined) => (bcName ? state.screen.filters[bcName] : undefined)

export const selectBcSorters = (state: RootState, bcName: string | undefined) => (bcName ? state.screen.sorters[bcName] : undefined)
