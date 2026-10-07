import React, { useCallback, useEffect, useRef } from 'react'
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
import type { MassOperationProcessing } from '@components/widgets/Table/massOperations/stepButtons'
import styles from './MassCryptoSign.less'

interface MassCryptoSignProps {
    widgetName: string
    bcName: string
    operationType: string
    /**
     * Certificates chosen on the step "Sign and encrypt": the rows are processed at once, the certificates are not shown
     */
    settings?: CryptoSettings
    /**
     * The action has a confirm after the certificates: they are given to it instead of processing the rows
     */
    onSettingsChosen?: (settings: CryptoSettings) => void
    /**
     * Sending of the action with the answer of the preInvoke confirm. Without it the action is sent without a confirm
     */
    confirmedSend?: () => void
    /**
     * Gets the processing when it starts and `undefined` when it ends
     */
    onProcessingChange: (processing?: MassOperationProcessing) => void
    /**
     * Interrupted before any row is processed, nothing is sent
     */
    onNothingSent?: () => void
}

/**
 * Mass signing and encryption: certificates, then the progress of processing the rows; the action is sent after them
 */
function MassCryptoSign({
    widgetName,
    bcName,
    operationType,
    settings,
    onSettingsChosen,
    confirmedSend,
    onProcessingChange,
    onNothingSent
}: MassCryptoSignProps) {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const { progress, processing, stopping, run, stop } = useMassCrypto(widgetName, bcName, operationType)
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

    // `run` gives `false` also when the step is left: then there is nobody to show the step again
    const mountedRef = useRef(true)
    useEffect(() => {
        return () => {
            mountedRef.current = false
        }
    }, [])

    const execute = useCallback(
        async (chosenSettings: CryptoSettings) => {
            const sent = await run(chosenSettings, confirmedSend ?? send)
            !sent && mountedRef.current && onNothingSent?.()
        },
        [confirmedSend, onNothingSent, run, send]
    )

    // the rows are processed once when the settings are given: the confirm is answered and the step shows only the progress
    const startedRef = useRef(false)
    useEffect(() => {
        if (settings && !startedRef.current) {
            startedRef.current = true
            execute(settings)
        }
    }, [execute, settings])

    // without a cleanup on every change: the buttons of the step would blink when `stopping` changes.
    // Sending of the action is a part of the processing: the step is not left until the answer comes
    useEffect(() => {
        if (processing) {
            onProcessingChange({ stop, stopping })
        } else {
            onProcessingChange(sending ? { stopping: false } : undefined)
        }
    }, [onProcessingChange, processing, sending, stop, stopping])

    useEffect(() => {
        return () => onProcessingChange(undefined)
    }, [onProcessingChange])

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

    if (settings || !widget) {
        return null
    }

    return (
        <CryptoGeneratorContent
            meta={widget}
            operationType={operationType}
            onExecute={onSettingsChosen ?? execute}
            executeText={onSettingsChosen && t('Next')}
        />
    )
}

export default React.memo(MassCryptoSign)
