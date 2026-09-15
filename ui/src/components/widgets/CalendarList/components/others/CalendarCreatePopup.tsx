import React, { useCallback } from 'react'
import { OperationTypeCrud } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import { selectBcRecordForm } from '@selectors/selectors'
import { useCalendarInternalForm } from '@components/widgets/CalendarList/hooks/useCalendarInternalForm'
import { useCalendarCreateInPopup } from '@components/widgets/CalendarList/hooks/useCalendarCreateInPopup'
import Popup from '@components/Popup/Popup'
import styles from '@components/widgets/FormPopup/FormPopup.less'

interface CalendarCreatePopupProps {
    /**
     * Calendar widget which create form is shown
     */
    meta: AppWidgetMeta
}

/**
 * Create form of a calendar widget in a popup (options.create.style "inlineForm" or "popup").
 * Rendered by the layout in place of the create widget, so the width is set by its gridWidth like for popup widgets.
 */
function CalendarCreatePopup({ meta }: CalendarCreatePopupProps) {
    const dispatch = useAppDispatch()
    const { internalWidget, isCreateStyle, renderForm } = useCalendarInternalForm(meta)
    const recordForm = useAppSelector(selectBcRecordForm(meta.bcName))

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
            showed={showed}
            title={internalWidget.title}
            bcName={meta.bcName}
            widgetName={internalWidget.name}
            disablePagination={true}
            footer={null}
            onCancelHandler={handleCancel}
        >
            <div className={styles.formPopupModal}>{renderForm(recordForm?.cursor)}</div>
        </Popup>
    )
}

export default React.memo(CalendarCreatePopup)
