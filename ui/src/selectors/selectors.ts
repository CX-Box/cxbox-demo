import { RootState } from '@store'
import { PendingValidationFails, WidgetMeta } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import { createUniversalSelector } from '@selectors/createUniversalSelector'

export const selectBc = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.screen.bo.bc?.[bcName] : undefined
)

export const selectBcRecordForm = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.view.recordForm?.[bcName] : undefined
)

export const selectBcData = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.data[bcName] : undefined
)

export const selectBcRowMeta = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.view.rowMeta?.[bcName] : undefined
)

export const selectBcUrlRowMeta = createUniversalSelector((state: RootState, bcName: string | undefined, includeSelf: boolean = true) =>
    bcName ? selectBcRowMeta(state, bcName)?.[buildBcUrl(bcName, includeSelf, state)] : undefined
)

export const selectBcMetaInProgress = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.view.metaInProgress?.[bcName] : undefined
)

export const selectBcPendingDataChanges = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.view.pendingDataChanges?.[bcName] : undefined
)

export const selectBcRecordPendingDataChanges = createUniversalSelector(
    (state: RootState, bcName: string | undefined, cursor: string | null | undefined) =>
        bcName && cursor ? state.view.pendingDataChanges?.[bcName]?.[cursor] : undefined
)

export const selectBcPendingValidationFails = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? (state.view.pendingValidationFails as PendingValidationFails)?.[bcName] : undefined
)

export const selectBcFilters = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.screen.filters[bcName] : undefined
)

export const selectBcSorters = createUniversalSelector((state: RootState, bcName: string | undefined) =>
    bcName ? state.screen.sorters[bcName] : undefined
)

export const selectWidget = createUniversalSelector((state: RootState, widgetName: string | undefined) =>
    widgetName ? state.view.widgets.find(widget => widgetName === widget?.name) : undefined
)

export const selectWidgetByCondition = createUniversalSelector((state: RootState, condition: (widget: WidgetMeta) => boolean) =>
    state.view.widgets.find(condition)
)

export const selectBcNameFromPopupData = createUniversalSelector((state: RootState) => {
    const { bcName, widgetName } = state.view.popupData ?? {}

    if (bcName) {
        return bcName
    }

    if (widgetName) {
        return state.view.widgets.find(widget => widget.name === widgetName)?.bcName
    }
})
