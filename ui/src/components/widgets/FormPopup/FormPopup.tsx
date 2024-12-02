import { Skeleton } from 'antd'
import React, { useCallback, useRef } from 'react'
import Form from '../Form/Form'
import Popup from '../../Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useAppDispatch, useAppSelector } from '@store'
import useFormPopupWidth from './hooks/useFormPopupWidth'
import { actions, interfaces } from '@cxbox-ui/core'
import { WidgetFormPopupMeta } from '@interfaces/widget'
import { OperationPreInvokeCustom } from '@interfaces/operation'
import styles from './FormPopup.less'

export interface FormPopupProps {
    meta: WidgetFormPopupMeta
}

export function FormPopup(props: FormPopupProps) {
    const dispatch = useAppDispatch()
    const formPopupRef = useRef<HTMLDivElement>(null)

    const bcName = props.meta.bcName

    const popupData = useAppSelector(state => state.view.popupData)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))

    const widgetName = props.meta.name
    const showed = popupData?.widgetName === widgetName
    const bcLoading = bc && bc.loading
    const preInvoke = popupData?.options?.operation?.preInvoke as OperationPreInvokeCustom | undefined

    const popupWidth = useFormPopupWidth(formPopupRef)

    const onClose = useCallback(() => {
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch(actions.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    const onSave = useCallback(() => {
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

    const popupTitle = (
        <WidgetTitle className={styles.title} level={1} widgetName={props.meta.name} text={preInvoke?.message ?? props.meta.title} />
    )

    return (
        <div ref={formPopupRef}>
            {showed && (
                <Popup
                    title={popupTitle}
                    showed
                    width={popupWidth}
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
            )}
        </div>
    )
}
