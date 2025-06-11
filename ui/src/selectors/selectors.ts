import { RootState } from '@store'
import { PendingValidationFails, WidgetMeta } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AppWidgetMeta } from '@interfaces/widget'

export const selectBc = (state: RootState, bcName: string | undefined) => (bcName ? state.screen.bo.bc?.[bcName] : undefined)

export const selectBcRecordForm = (state: RootState, bcName: string | undefined) => (bcName ? state.view.recordForm?.[bcName] : undefined)

export const selectBcData = (state: RootState, bcName: string | undefined) => (bcName ? state.data[bcName] : undefined)

export const selectBcRowMeta = (state: RootState, bcName: string | undefined) => (bcName ? state.view.rowMeta?.[bcName] : undefined)

export const selectBcUrlRowMeta = (state: RootState, bcName: string | undefined, includeSelf: boolean = true) =>
    bcName ? selectBcRowMeta(state, bcName)?.[buildBcUrl(bcName, includeSelf, state)] : undefined

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

export const selectInternalWidgetsBcName = (state: RootState, widgetName: string | undefined) => {
    const externalWidget = widgetName ? (state.view.widgets.find(item => item.name === widgetName) as AppWidgetMeta) : undefined

    return state.view.widgets.find(
        widget => externalWidget?.options?.create?.widget === widget?.name || externalWidget?.options?.edit?.widget === widget?.name
    )?.bcName as string
}

export const selectWidget = (state: RootState, widgetName: string | undefined) =>
    widgetName ? state.view.widgets.find(widget => widgetName === widget?.name) : undefined

export const selectWidgetByCondition = (state: RootState, condition: (widget: WidgetMeta) => boolean) => state.view.widgets.find(condition)
