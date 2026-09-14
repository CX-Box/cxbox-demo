import React, { useCallback } from 'react'
import { Spin } from 'antd'
import { OperationTypeCrud } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { selectBcMetaInProgress, selectBcRecordForm } from '@selectors/selectors'
import { useInternalWidget } from '@hooks/useInternalWidget'
import { useCalendarCreateInPopup } from '@components/widgets/CalendarList/hooks/useCalendarCreateInPopup'
import Popup from '@components/Popup/Popup'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import InnerForm from '@components/widgets/CalendarList/components/others/InnerForm'
import styles from './CalendarCreatePopup.less'

interface CalendarCreatePopupProps {
    meta: AppWidgetMeta
}

/**
 * Create form of a calendar widget shown in a modal (options.create.style = "popup", the default for calendars)
 */
function CalendarCreatePopup({ meta }: CalendarCreatePopupProps) {
    const dispatch = useAppDispatch()
    const { internalWidget, internalWidgetOperations, isCreateStyle } = useInternalWidget(meta)
    const recordForm = useAppSelector(selectBcRecordForm(meta.bcName))
    const rowMetaInProgress = useAppSelector(selectBcMetaInProgress(meta.bcName))

    const isCreateInPopup = useCalendarCreateInPopup(meta)
    const showed = isCreateInPopup && !!internalWidget && !!recordForm?.create && isCreateStyle

    const handleCancel = useCallback(() => {
        dispatch(
            actions.sendOperation({
                bcName: meta.bcName,
                operationType: OperationTypeCrud.cancelCreate,
                widgetName: internalWidget?.name ?? meta.name
            })
        )
    }, [dispatch, internalWidget?.name, meta.bcName, meta.name])

    if (!internalWidget || !showed) {
        return null
    }

    return (
        <Popup
            className={styles.popupContainer}
            size="medium"
            showed={showed}
            title={internalWidget.title}
            bcName={meta.bcName}
            widgetName={internalWidget.name}
            disablePagination={true}
            footer={null}
            onCancelHandler={handleCancel}
        >
            <div className={styles.content}>
                <DebugWidgetWrapper meta={internalWidget}>
                    <Spin spinning={rowMetaInProgress}>
                        <InnerForm widgetMeta={internalWidget} operations={internalWidgetOperations} rowId={recordForm?.cursor} />
                    </Spin>
                </DebugWidgetWrapper>
            </div>
        </Popup>
    )
}

export default React.memo(CalendarCreatePopup)
