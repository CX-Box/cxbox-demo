import { AppWidgetMeta } from '@interfaces/widget'
import React from 'react'
import { useAppSelector } from '@store'
import { Spin } from 'antd'
import { useInternalWidgetSelector } from '@hooks/useInternalWidgetSelector'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import InternalForm from '@components/FileViewerPopup/InternalForm'
import { selectBc, selectBcData, selectBcUrlRowMeta } from '@selectors/selectors'
import { WidgetFormMeta } from '@cxbox-ui/core'

export function useInternalForm(currentWidgetMeta: AppWidgetMeta | undefined) {
    const { internalWidget, internalWidgetOperations, isCreateStyle, isEditStyle, internalWidgetActiveCursor } = useInternalWidgetSelector(
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

    const formElement =
        internalWidget !== undefined ? (
            <DebugWidgetWrapper meta={internalWidget}>
                <Spin spinning={isLoading}>
                    <InternalForm widgetMeta={internalWidget as WidgetFormMeta} operations={internalWidgetOperations} />
                </Spin>
            </DebugWidgetWrapper>
        ) : null

    return {
        isCreateStyle,
        isEditStyle,
        formElement
    }
}
