import React, { useCallback, useEffect, useState } from 'react'
import { Progress, Spin } from 'antd'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@store'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { actions } from '@actions'
import { selectWidget } from '@selectors/selectors'
import { AppWidgetMeta } from '@interfaces/widget'
import CryptoGeneratorContent from '@components/CryptoGeneratorContent/CryptoGeneratorContent'
import { CryptoSettings } from '@components/CryptoGeneratorContent/cryptoFile'
import { useMassCrypto } from '@components/widgets/Table/massOperations/Crypto/useMassCrypto'
import Confirm from '@components/widgets/Table/massOperations/Confirm/Confirm'
import styles from './MassCryptoConfirm.less'

/**
 * Processing of the rows, the button "Interrupt and next" of the step stops it
 */
export interface MassCryptoProcessing {
    stop: () => void
}

interface MassCryptoConfirmProps {
    widgetName: string
    bcName: string
    operationType: string
    /**
     * The action asks for a confirmation: it is shown first with its own buttons, the certificates after it.
     * The answer of the confirm is sent with the action after the rows are signed
     */
    hasPreInvoke: boolean
    /**
     * Gets the processing when it starts and `undefined` when it ends
     */
    onProcessingChange: (processing?: MassCryptoProcessing) => void
}

/**
 * Step "Confirm operation" of mass signing and encryption: the preInvoke confirm if the action has one, certificates,
 * then the progress of processing the rows
 */
function MassCryptoConfirm({ widgetName, bcName, operationType, hasPreInvoke, onProcessingChange }: MassCryptoConfirmProps) {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const confirmWidgetName = useAppSelector(state => state.view.popupData?.widgetName) ?? widgetName
    // sending of the confirmed action, it is called after the rows are signed
    const [confirmed, setConfirmed] = useState<{ send: () => void }>()
    const { progress, processing, run, stop } = useMassCrypto(widgetName, bcName, operationType)
    const sending = useOperationInProgress(bcName)(operationType)

    const send = useCallback(() => {
        dispatch(
            actions.sendOperation({
                bcName,
                operationType,
                widgetName,
                onSuccessAction: actions.changeOperationStep({ bcName, step: 'View results' })
            })
        )
    }, [bcName, dispatch, operationType, widgetName])

    const execute = useCallback(
        (settings: CryptoSettings) => {
            run(settings, confirmed?.send ?? send)
        },
        [confirmed, run, send]
    )

    const confirm = useCallback((confirmedSend: () => void) => {
        setConfirmed({ send: confirmedSend })
    }, [])

    useEffect(() => {
        if (!processing) {
            return
        }
        onProcessingChange({ stop })
        return () => onProcessingChange(undefined)
    }, [onProcessingChange, processing, stop])

    if (progress) {
        return (
            <div className={styles.progress}>
                <Spin spinning={processing || sending} />
                <Progress
                    className={styles.bar}
                    percent={Math.floor((progress.done / progress.total) * 100)}
                    showInfo={false}
                    size="small"
                />
                <span className={styles.text}>{t('Mass crypto progress', progress)}</span>
            </div>
        )
    }

    if (hasPreInvoke && !confirmed) {
        return <Confirm widgetName={confirmWidgetName} onConfirm={confirm} />
    }

    return widget ? <CryptoGeneratorContent meta={widget} operationType={operationType} onExecute={execute} /> : null
}

export default React.memo(MassCryptoConfirm)
