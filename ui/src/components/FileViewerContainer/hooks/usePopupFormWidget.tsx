import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { useInternalWidget } from '@hooks/useInternalWidget'
import { selectBc, selectBcData, selectBcUrlRowMeta } from '@selectors/selectors'

export function usePopupFormWidget(currentWidgetMeta: AppWidgetMeta | undefined) {
    const { internalWidget, internalWidgetOperations, isCreateStyle, isEditStyle, internalWidgetActiveCursor } = useInternalWidget(
        currentWidgetMeta,
        'popup'
    )
    const recordForm = useAppSelector(state => (internalWidget?.bcName ? state.view.recordForm[internalWidget?.bcName] : undefined))
    const currentActiveRowId = recordForm?.cursor
    const isLoading =
        useAppSelector(state => {
            const loading = selectBc(state, internalWidget?.bcName)?.loading
            const dataExists = !!selectBcData(state, internalWidget?.bcName)
            const rowMetaExists = !!selectBcUrlRowMeta(state, internalWidget?.bcName)

            return !!(loading && (rowMetaExists || dataExists))
        }) || currentActiveRowId !== internalWidgetActiveCursor

    return {
        internalWidget,
        internalWidgetOperations,
        isCreateStyle,
        isEditStyle,
        isLoading
    }
}
