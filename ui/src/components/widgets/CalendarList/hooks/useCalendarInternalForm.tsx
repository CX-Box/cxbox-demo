import React, { useCallback } from 'react'
import { Spin } from 'antd'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectBcMetaInProgress } from '@selectors/selectors'
import { useInternalWidget } from '@hooks/useInternalWidget'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import InnerForm from '@components/widgets/CalendarList/components/others/InnerForm'

/**
 * Create and edit form of a calendar widget, one logic for both like useExpandableForm in Table:
 * the internal widget (options.create or options.edit) is resolved by useInternalWidget,
 * the form is rendered and its loading is computed the same way for the edit popover and the create popup
 */
export function useCalendarInternalForm(meta: AppWidgetMeta) {
    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, internalWidgetStyle, isCreateStyle } =
        useInternalWidget(meta)
    const rowMetaInProgress = useAppSelector(selectBcMetaInProgress(internalWidget?.bcName))

    const renderForm = useCallback(
        (cursor: string | undefined, additionalOperations?: React.ReactNode) => {
            if (!internalWidget) {
                return null
            }

            const isLoading = cursor !== internalWidgetActiveCursor || rowMetaInProgress

            return (
                <DebugWidgetWrapper meta={internalWidget}>
                    <Spin spinning={isLoading}>
                        <InnerForm
                            widgetMeta={internalWidget}
                            operations={internalWidgetOperations}
                            rowId={cursor}
                            additionalOperations={additionalOperations}
                        />
                    </Spin>
                </DebugWidgetWrapper>
            )
        },
        [internalWidget, internalWidgetActiveCursor, internalWidgetOperations, rowMetaInProgress]
    )

    return { internalWidget, internalWidgetStyle, internalWidgetActiveCursor, isCreateStyle, renderForm }
}
