import { Skeleton } from 'antd'
import React, { useCallback } from 'react'
import styles from './FormPopup.less'
import Form from '../Form/Form'
import { WidgetFormPopupMeta } from '@interfaces/widget'
import { OperationPreInvokeCustom } from '@interfaces/operation'
import Popup from '../../Popup/Popup'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'

export interface FormPopupProps {
    meta: WidgetFormPopupMeta
}

export function FormPopup(props: FormPopupProps) {
    const dispatch = useAppDispatch()
    const bcName = props.meta.bcName
    const popupData = useAppSelector(state => state.view.popupData)
    const showed = popupData?.bcName === bcName
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const bcLoading = bc && bc.loading

    const onClose = useCallback(() => {
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch(actions.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    const onSave = React.useCallback(() => {
        if (!bcLoading && popupData?.options?.operation) {
            dispatch(
                actions.sendOperation({
                    ...popupData?.options?.operation,
                    confirm: 'ok'
                })
            )
            dispatch(actions.closeViewPopup({ bcName }))
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
                            type: interfaces.WidgetTypes.Form
                        }}
                    />
                </div>
            )}
        </Popup>
    )
}
