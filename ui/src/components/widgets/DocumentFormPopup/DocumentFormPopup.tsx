import { actions } from '@actions'
import { Spin } from 'antd'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './DocumentFormPopup.less'
import Form from '../Form/Form'
import { WidgetFormPopupMeta } from '@interfaces/widget'
import Popup from '../../Popup/Popup'
import { OperationTypeCrud, WidgetTypes } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'

export interface DocumentFormPopupProps {
    meta: WidgetFormPopupMeta
}

export function DocumentFormPopup({ meta }: DocumentFormPopupProps) {
    const { bcName } = meta
    const popupData = useAppSelector(state => state.view.popupData)
    const showed = popupData?.bcName === bcName

    const dispatch = useDispatch()
    const bcLoading = useAppSelector(state => state.screen.bo.bc[bcName])?.loading

    const onClose = useCallback(() => {
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch(actions.closeViewPopup({ bcName }))
    }, [bcName, dispatch])

    const onSave = React.useCallback(() => {
        if (!bcLoading) {
            dispatch(actions.sendOperation({ bcName, operationType: OperationTypeCrud.save, widgetName: meta.name }))
            dispatch(actions.closeViewPopup({ bcName }))
        }
    }, [bcLoading, dispatch, bcName, meta.name])

    if (!showed) {
        return null
    }

    return (
        <Popup
            title={meta.title}
            showed
            size={'large'}
            onOkHandler={onSave}
            onCancelHandler={onClose}
            bcName={bcName}
            widgetName={meta.name}
            disablePagination={true}
            className={styles.popup}
        >
            <Spin spinning={bcLoading}>
                <div className={styles.formPopupModal}>
                    <Form
                        meta={{
                            ...meta,
                            type: WidgetTypes.Form
                        }}
                    />
                </div>
            </Spin>
        </Popup>
    )
}
