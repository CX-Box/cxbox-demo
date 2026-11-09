import React, { useCallback } from 'react'
import { OperationTypeCrud } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, resetRecordForm } from '@actions'
import { selectBcMetaInProgress, selectBcRecordForm } from '@selectors/selectors'
import { useInternalWidget } from '@hooks/useInternalWidget'
import { isInternalFormPopup } from '@utils/internalFormPopup'
import Popup from '@components/Popup/Popup'
import InnerWidget from '@components/InnerWidget/InnerWidget'
import Operations from '@components/Operations/Operations'
import styles from '@components/widgets/FormPopup/FormPopup.less'

interface InternalFormPopupProps {
    /**
     * Form widget of options.create or options.edit
     */
    widget: AppWidgetMeta
    /**
     * Widget which options refer to the form
     */
    owner: AppWidgetMeta
}

/**
 * Create or edit form of a widget in a popup. Shows exactly the form widget, with its title and actions.
 */
function InternalFormPopup({ widget, owner }: InternalFormPopupProps) {
    const dispatch = useAppDispatch()
    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, isCreateStyle } = useInternalWidget(owner)
    const recordForm = useAppSelector(selectBcRecordForm(owner.bcName))
    const rowMetaInProgress = useAppSelector(selectBcMetaInProgress(widget.bcName))

    // the record form of the bc can be opened by another widget of the same bc:
    // the create operation opens it with the name of the create form, the owner opens the edit form with its own name
    const isOwnRecordForm = recordForm?.widgetName === widget.name || recordForm?.widgetName === owner.name
    const showed =
        internalWidget?.name === widget.name &&
        isInternalFormPopup(owner, isCreateStyle ? 'create' : 'edit') &&
        !!recordForm?.active &&
        isOwnRecordForm

    const handleCancel = useCallback(() => {
        if (isCreateStyle) {
            dispatch(
                actions.sendOperation({
                    bcName: widget.bcName,
                    operationType: OperationTypeCrud.cancelCreate,
                    widgetName: widget.name
                })
            )
        } else {
            dispatch(resetRecordForm({ bcName: widget.bcName }))
        }
    }, [dispatch, isCreateStyle, widget.bcName, widget.name])

    if (!showed) {
        return null
    }

    return (
        <Popup
            className={styles.popupContainer}
            showed={showed}
            title={widget.title}
            bcName={widget.bcName}
            widgetName={widget.name}
            disablePagination={true}
            footer={null}
            onCancelHandler={handleCancel}
        >
            <div className={styles.formPopupModal}>
                <InnerWidget
                    widgetName={widget.name}
                    title={null}
                    rowId={internalWidgetActiveCursor}
                    spinning={rowMetaInProgress}
                    afterWidget={
                        internalWidgetOperations?.length ? (
                            <Operations operations={internalWidgetOperations} bcName={widget.bcName} widgetMeta={widget} />
                        ) : null
                    }
                />
            </div>
        </Popup>
    )
}

export default React.memo(InternalFormPopup)
