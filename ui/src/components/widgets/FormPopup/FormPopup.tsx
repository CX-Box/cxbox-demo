import { $do } from '@cxbox-ui/core'
import { WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import { Skeleton } from 'antd'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../interfaces/storeSlices'
import styles from './FormPopup.less'
import Form from '../Form/Form'
import { WidgetFormPopupMeta } from '../../../interfaces/widget'
import { OperationPreInvokeCustom } from '../../../interfaces/operation'
import Popup from '../../Popup/Popup'

export interface FormPopupProps {
    meta: WidgetFormPopupMeta
}

export function FormPopup(props: FormPopupProps) {
    const dispatch = useDispatch()
    const bcName = props.meta.bcName
    const popupData = useSelector((state: AppState) => state.view.popupData)
    const showed = popupData?.bcName === bcName
    const bc = useSelector((state: AppState) => state.screen.bo.bc[bcName])
    const bcLoading = bc && bc.loading

    const onClose = useCallback(() => {
        dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch($do.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    const onSave = React.useCallback(() => {
        if (!bcLoading && popupData?.options?.operation) {
            dispatch(
                $do.sendOperation({
                    ...popupData?.options?.operation,
                    confirm: 'ok'
                })
            )
            dispatch($do.closeViewPopup({ bcName }))
        }
    }, [bcLoading, popupData?.options?.operation, dispatch, bcName])

    if (!showed) {
        return null
    }

    const preInvoke = popupData?.options?.operation?.preInvoke as OperationPreInvokeCustom | undefined

    return (
        <Popup
            title={preInvoke?.message ?? props.meta.title}
            showed
            size="medium"
            onOkHandler={onSave}
            onCancelHandler={onClose}
            bcName={bcName}
            widgetName={props.meta.name}
            disablePagination={true}
            defaultOkText={preInvoke?.yesText}
            defaultCancelText={preInvoke?.noText}
        >
            {bcLoading ? (
                <Skeleton loading paragraph={{ rows: 5 }} />
            ) : (
                <div className={styles.formPopupModal}>
                    <Form
                        meta={{
                            ...props.meta,
                            type: WidgetTypes.Form
                        }}
                    />
                </div>
            )}
        </Popup>
    )
}
