import { Skeleton } from 'antd'
import React, { useCallback, useEffect } from 'react'
import Form from '../Form/Form'
import Popup from '../../Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useAppDispatch, useAppSelector } from '@store'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { usePopupVisibility } from '@hooks/popup'
import { actions } from '@actions'
import { WidgetFormPopupMeta } from '@interfaces/widget'
import styles from './FormPopup.module.less'

export interface FormPopupProps {
    meta: WidgetFormPopupMeta
}

const forceUpdateSetting = true // todo temporary enabled for all FormPopup widgets

export function FormPopup(props: FormPopupProps) {
    const dispatch = useAppDispatch()

    const bcName = props.meta.bcName

    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const forceUpdateRowMetaPending =
        useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active')?.length ?? 0) > 0

    // todo get from featureSettings or from options
    // const forceUpdateSetting = useAppSelector(
    //     state => state.session.featureSettings?.find(featureSetting => featureSetting.key === 'formPopupForceUpdate')?.value === 'true'
    // )
    //
    // const forceUpdateOption = meta?.options?.forceUpdate

    const widgetName = props.meta.name
    const { popupData, closePopup, preInvoke, visibility: showed } = usePopupVisibility(widgetName, bcName)
    const bcLoading = bc && bc.loading

    const isOperationInProgress = useOperationInProgress(bcName)

    const onClose = useCallback(() => {
        // to prevent data clearing on the main widget
        const needClearPendingDataForPopup = bcName !== popupData?.calleeBCName

        needClearPendingDataForPopup && dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))

        closePopup()
    }, [bcName, closePopup, dispatch, popupData?.calleeBCName])

    const onSave = useCallback(() => {
        if (!bcLoading && popupData?.options?.operation) {
            dispatch(
                actions.sendOperation({
                    ...popupData?.options?.operation,
                    confirm: 'ok'
                })
            )
        }
    }, [bcLoading, popupData?.options?.operation, dispatch])

    useEffect(() => {
        if (forceUpdateSetting && showed) {
            dispatch(actions.forceUpdateRowMeta({ bcName }))
        }
    }, [bcName, dispatch, showed, widgetName])

    if (!showed) {
        return null
    }

    const popupTitle = (
        <WidgetTitle className={styles.title} level={1} widgetName={props.meta.name} text={preInvoke?.message ?? props.meta.title} />
    )

    return (
        <Popup
            className={styles.popupContainer}
            title={popupTitle}
            showed
            onOkHandler={onSave}
            onCancelHandler={onClose}
            bcName={bcName}
            widgetName={props.meta.name}
            disablePagination={true}
            getContainer={null}
            defaultOkText={preInvoke?.yesText}
            defaultCancelText={preInvoke?.noText}
            okButtonProps={{
                loading: isOperationInProgress(popupData?.options?.operation?.operationType)
            }}
        >
            {bcLoading || forceUpdateRowMetaPending ? (
                <div data-test-loading={true}>
                    <Skeleton loading paragraph={{ rows: 5 }} />
                </div>
            ) : (
                <div className={styles.formPopupModal}>
                    <Form meta={props.meta} />
                </div>
            )}
        </Popup>
    )
}
