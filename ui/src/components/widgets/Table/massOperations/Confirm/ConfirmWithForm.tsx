import React, { useCallback, useEffect } from 'react'
import { Skeleton } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { usePopupVisibility } from '@hooks/popup'
import { actions } from '@actions'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { selectBc, selectWidget } from '@selectors/selectors'
import Form from '@components/widgets/Form/Form'
import { WidgetFormMeta } from '@cxbox-ui/core'
import Button from '@components/ui/Button/Button'
import styles from './ConfirmWithForm.module.less'
import { useTranslation } from 'react-i18next'

interface ConfirmWithFormProps {
    widgetName: string
}

const forceUpdateSetting = true // todo temporary enabled for all FormPopup widgets

function ConfirmWithForm({ widgetName }: ConfirmWithFormProps) {
    const { t } = useTranslation()

    const widget = useAppSelector(state => selectWidget(state, widgetName)) as WidgetFormMeta
    const bcName = widget?.bcName as string
    const bc = useAppSelector(state => selectBc(state, bcName))
    const forceUpdateRowMetaPending =
        useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active')?.length ?? 0) > 0

    const { popupData, preInvoke, visibility: showed } = usePopupVisibility(widgetName, bcName, 'mass')

    const dispatch = useAppDispatch()

    const onClose = useCallback(() => {
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))

        dispatch(actions.resetViewerMode({ bcName }))
    }, [bcName, dispatch])

    const onSave = useCallback(() => {
        if (!bc?.loading && popupData?.options?.operation) {
            dispatch(
                actions.sendOperation({
                    ...popupData?.options?.operation,
                    confirm: 'ok',
                    onSuccessAction: actions.changeOperationStep({ bcName, step: 'View results' })
                })
            )
        }
    }, [bc?.loading, popupData?.options?.operation, dispatch, bcName])

    useEffect(() => {
        if (forceUpdateSetting && showed) {
            dispatch(actions.forceUpdateRowMeta({ bcName }))
        }
    }, [bcName, dispatch, showed, widgetName])

    return showed ? (
        <div className={styles.root}>
            <WidgetTitle className={styles.title} level={2} widgetName={widgetName} text={preInvoke?.message ?? widget?.title} />
            {bc?.loading || forceUpdateRowMetaPending ? (
                <div data-test-loading={true}>
                    <Skeleton loading paragraph={{ rows: 5 }} />
                </div>
            ) : (
                <div className={styles.formPopupModal}>
                    <Form meta={widget} />
                    <div className={styles.actions}>
                        <Button onClick={onSave}>{preInvoke?.yesText ?? t('Save')}</Button>
                        <Button onClick={onClose} type="formOperation">
                            {preInvoke?.noText ?? t('Cancel')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    ) : null
}

export default React.memo(ConfirmWithForm)
