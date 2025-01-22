import { Skeleton } from 'antd'
import React, { useCallback, useEffect, useRef } from 'react'
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

const forceUpdateSetting = true // todo temporary enabled for all FormPopup widgets

export function FormPopup(props: FormPopupProps) {
    const dispatch = useAppDispatch()
    const formPopupRef = useRef<HTMLDivElement>(null)

    const bcName = props.meta.bcName

    const popupData = useAppSelector(state => state.view.popupData)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    // todo get from featureSettings or from options
    // const forceUpdateSetting = useAppSelector(
    //     state => state.session.featureSettings?.find(featureSetting => featureSetting.key === 'formPopupForceUpdate')?.value === 'true'
    // )
    //
    // const forceUpdateOption = meta?.options?.forceUpdate

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
        }
    }, [bcLoading, popupData?.options?.operation, dispatch])

    const popupTitle = (
        <WidgetTitle className={styles.title} level={1} widgetName={props.meta.name} text={preInvoke?.message ?? props.meta.title} />
    )

    useEffect(() => {
        if (forceUpdateSetting && showed) {
            dispatch(actions.bcFetchRowMeta({ widgetName, bcName }))
        }
    }, [bcName, dispatch, showed, widgetName])

    return (
        <div ref={formPopupRef}>
            {showed && (
                <Popup
                    className={styles.popupContainer}
                    title={popupTitle}
                    showed
                    width={popupWidth}
                    onOkHandler={onSave}
                    onCancelHandler={onClose}
                    bcName={bcName}
                    widgetName={props.meta.name}
                    disablePagination={true}
                    getContainer={null}
                    defaultOkText={preInvoke?.yesText}
                    defaultCancelText={preInvoke?.noText}
                >
                    {bcLoading ? (
                        <div data-test-loading={true}>
                            <Skeleton loading paragraph={{ rows: 5 }} />
                        </div>
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
