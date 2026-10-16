import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layout as AntdLayout } from 'antd'
import Steps from '@components/widgets/Table/massOperations/Steps'
import {
    MASS_STEPS,
    MassOperationType,
    MassStepType,
    MAX_TAGS_COUNT,
    OPERATIONS_ACCESSIBILITY_BY_STEP
} from '@components/widgets/Table/massOperations/constants'
import Operations from '@components/widgets/Table/massOperations/Operations'
import { TagType } from '@components/ui/Tags/Tags'
import { useAppSelector } from '@store'
import { shallowEqual, useDispatch } from 'react-redux'
import { actions } from '@actions'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { BcFilter, OperationPostInvokeConfirm, OperationPostInvokeConfirmType, utils } from '@cxbox-ui/core'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '@interfaces/operation'
import { useTranslation } from 'react-i18next'
import { AppWidgetMeta } from '@interfaces/widget'
import { postInvokeHasRefreshBc } from '@utils/postInvokeHasRefreshBc'
import type { MassOperationProcessing } from '@components/widgets/Table/massOperations/stepButtons'
import type { MassResultCounts } from '@components/widgets/Table/massOperations/stepContent'
import { getCryptoGenerator } from '@components/CryptoGeneratorContent/cryptoFile'
import type { CryptoSettings } from '@components/CryptoGeneratorContent/cryptoFile'
import { FilterType } from '@interfaces/filters'
import Title from '@components/widgets/Table/massOperations/Title'
import { AVAILABLE_FILE_EXTENSIONS, getColumnValuesByHeaderFromFile } from '@utils/excel'
import { openNotification } from '@components/NotificationsContainer/utils'
import { FIELDS } from '@constants'
import { useMassStepActions } from '@components/widgets/Table/massOperations/hooks/useMassStepActions'
import { getStepButtonProps } from '@components/widgets/Table/massOperations/stepButtons'
import { defaultMassOperation } from '@components/widgets/Table/massOperations/massOperationKind'
import { cryptoMassOperation } from '@components/widgets/Table/massOperations/Crypto/cryptoMassOperation'

const { Header, Content, Sider } = AntdLayout

interface LayoutProps {
    widgetName: string
    bcName: string
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ widgetName, bcName, children }) => {
    const { t } = useTranslation()

    const { step, operationType, mode } = useAppSelector(state => state.screen.viewerMode[bcName]) ?? {}
    const postInvoke = useAppSelector(state => state.view.pendingPostInvoke[bcName]?.[operationType as string])
    const viewName = useAppSelector(state => state.view.name)
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const rowMeta = useAppSelector(state => selectBcUrlRowMeta(state, bcName))
    const bcData = useAppSelector(state => selectBcData(state, bcName))
    const bc = useAppSelector(state => selectBc(state, bcName))
    const flattenOperations = useMemo(() => {
        return rowMeta?.actions ? utils.flattenOperations(rowMeta?.actions) : []
    }, [rowMeta?.actions])
    const { previousLimit, massModeLimit } = useAppSelector(state => {
        const previousLimit = state.screen.pagination[bcName]?.limit
        const massModeLimit = state.screen.bo.bc[bcName]?.massLimit

        return {
            previousLimit,
            massModeLimit
        }
    }, shallowEqual)

    const currentMassOperation = useMemo(
        () => flattenOperations.find(operation => operation.type === operationType),
        [flattenOperations, operationType]
    )
    // mass signing and encryption: certificates on the step "Sign and encrypt", the rows are processed after the confirm if there is one
    const isCryptoOperation = !!getCryptoGenerator(widget, operationType)
    const operationKind = isCryptoOperation ? cryptoMassOperation : defaultMassOperation

    const { select, selectItems, selectedRows, clearSelectedRows } = useRowSelection(widgetName)

    const dispatch = useDispatch()

    const needDataUpdate = useRef(false)

    needDataUpdate.current = massModeLimit !== previousLimit

    useEffect(() => {
        if (mode === 'mass' && needDataUpdate.current) {
            dispatch(actions.bcForceUpdate({ bcName }))
        }
    }, [bcName, dispatch, mode])

    useEffect(() => {
        return () => {
            dispatch(actions.closeConfirmModal())
            dispatch(actions.closeViewPopup({ bcName }))
            dispatch(actions.clearSelectedRows({ bcName }))
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
            dispatch(
                actions.bcRemoveFilter({
                    bcName: bcName,
                    filter: { type: 'equalsOneOf', fieldName: FIELDS.TECHNICAL.ID } as BcFilter
                })
            )
        }
    }, [bcName, dispatch])

    const needBcForceUpdate = !postInvokeHasRefreshBc(bcName, postInvoke)

    useEffect(() => {
        return () => {
            needBcForceUpdate && dispatch(actions.bcForceUpdate({ bcName }))
        }
    }, [bcName, dispatch, needBcForceUpdate])

    const currentStep = step as MassStepType

    const moveToStep = useCallback(
        (type: MassStepType) => {
            dispatch(actions.changeOperationStep({ bcName, step: type }))
        },
        [bcName, dispatch]
    )

    const tags = selectedRows as TagType[]

    const hasMassPreInvoke = useMemo(() => {
        const confirmPreInvoke = currentMassOperation?.preInvoke as OperationPostInvokeConfirm | undefined
        const customPreInvoke = currentMassOperation?.preInvoke as OperationPreInvokeCustom | undefined

        return (
            confirmPreInvoke?.type === OperationPostInvokeConfirmType.confirm ||
            (customPreInvoke?.type === OperationPreInvokeTypeCustom.custom &&
                customPreInvoke.subtype === OperationPreInvokeSubType.confirmWithCustomWidget)
        )
    }, [currentMassOperation?.preInvoke])

    const steps = useMemo(() => operationKind.getSteps(hasMassPreInvoke), [hasMassPreInvoke, operationKind])

    const [wasOperationCall, setWasOperationCall] = useState(false)
    const [processing, setProcessing] = useState<MassOperationProcessing>()
    // mass signing with preInvoke: the certificates of the step before the confirm and the answer of the confirm,
    // the rows are processed and the action is sent after the confirm
    const [cryptoSettings, setCryptoSettings] = useState<CryptoSettings>()
    const [confirmed, setConfirmed] = useState<{ send: () => void }>()

    useEffect(() => {
        if (wasOperationCall && bcData?.length && !bc?.loading) {
            setWasOperationCall(false)
            dispatch(
                actions.sendOperation({
                    bcName,
                    operationType: currentMassOperation?.type as string,
                    widgetName: widgetName,
                    bcKey: currentMassOperation?.bcKey,
                    confirmOperation: currentMassOperation?.preInvoke,
                    onSuccessAction: actions.changeOperationStep({
                        bcName,
                        step: 'View results' as MassStepType
                    })
                })
            )
        } else if (bcData?.length === 0 && !bc?.loading) {
            setWasOperationCall(false)
        }
    }, [
        bc?.loading,
        bcData?.length,
        bcName,
        currentMassOperation?.bcKey,
        currentMassOperation?.preInvoke,
        currentMassOperation?.type,
        dispatch,
        wasOperationCall,
        widgetName
    ])

    const selectFromFileInputRef = useRef<HTMLInputElement>(null)

    const stepActions = useMassStepActions({
        widgetName,
        bcName,
        steps,
        moveToStep,
        hasMassPreInvoke,
        sendAfterReload: () => setWasOperationCall(true),
        selectFromFile: () => selectFromFileInputRef.current?.click()
    })
    const stepButtons = operationKind.stepButtons[currentStep]?.(
        {
            hasOperation: !!currentMassOperation,
            hasSelectedRows: !!selectedRows?.length,
            hasStepsAfterReview: steps[steps.indexOf('Review rows') + 1] !== 'View results',
            processing
        },
        stepActions
    )
    const getOperationProps = (buttonType: MassOperationType) => getStepButtonProps(stepButtons ?? {}, buttonType)

    const enabledTags = currentStep === 'Select rows' && widget?.options?.massOp?.pickMapFieldKey !== null
    const popupData = useAppSelector(state => state.view.popupData)

    const resultCounts = useMemo(
        () =>
            (selectedRows ?? []).reduce<MassResultCounts>(
                (counts, row) => {
                    if (row.success === true) {
                        counts.success++
                    } else if (row.success === false) {
                        counts.fail++
                    }
                    return counts
                },
                { success: 0, fail: 0 }
            ),
        [selectedRows]
    )

    const stepContent = operationKind.stepContent[currentStep]?.({
        widgetName,
        bcName,
        operationType: operationType as string,
        table: children,
        resultCounts,
        nextStep: steps[steps.indexOf(currentStep) + 1],
        settings: cryptoSettings,
        onSettingsChosen: settings => {
            setCryptoSettings(settings)
            // an answer of a previous pass must not start the processing at once
            setConfirmed(undefined)
            stepActions.goToNextStep()
        },
        confirmWidgetName: popupData?.widgetName ?? widgetName,
        onConfirm: send => setConfirmed({ send }),
        confirmedSend: confirmed?.send,
        onConfirmReset: () => setConfirmed(undefined),
        onProcessingChange: setProcessing
    })

    const selectFromFileChange = async () => {
        const files = selectFromFileInputRef.current?.files
        const file = files?.[0]
        const ids = file
            ? Array.from(
                  new Set((await getColumnValuesByHeaderFromFile(file, FIELDS.TECHNICAL.ID))?.map(id => String(id).trim()).filter(id => id))
              )
            : undefined

        if (ids?.length) {
            clearSelectedRows()
            dispatch(
                actions.bcAddFilter({
                    bcName: bcName as string,
                    filter: {
                        type: FilterType.equalsOneOf,
                        value: ids,
                        fieldName: FIELDS.TECHNICAL.ID,
                        viewName,
                        widgetName: widgetName
                    },
                    widgetName: widgetName
                })
            )
            selectItems(
                true,
                ids.map(id => ({
                    id,
                    title: id
                }))
            )
            dispatch(actions.bcForceUpdate({ bcName }))
            moveToStep('Review rows')
        } else {
            openNotification({
                type: 'warning',
                message: t('The file could not be processed or it does not contain values for field {{name}}', {
                    name: FIELDS.TECHNICAL.ID
                })
            })
        }

        if (selectFromFileInputRef.current) {
            selectFromFileInputRef.current.value = ''
        }
    }

    const fileInput = (
        <input
            ref={selectFromFileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={selectFromFileChange}
            accept={AVAILABLE_FILE_EXTENSIONS.join(', ')}
        />
    )

    const closeTag = useCallback(
        (value: TagType) => {
            select(value as any, false)
        },
        [select]
    )

    const stepTitles = useMemo(
        () =>
            MASS_STEPS.filter(item => item.step && steps.includes(item.step)).map(item => ({
                ...item,
                title: item.step && t(operationKind.getStepTitle?.(item.step, widget, operationType) ?? item.step)
            })),
        [operationKind, operationType, steps, t, widget]
    )

    return (
        <AntdLayout style={{}}>
            <Sider theme={'light'} style={{ padding: '0 10px 10px' }}>
                <Title level={2} title={t('Mass operation')} />
                <Steps currentStep={currentStep} values={stepTitles} />
            </Sider>
            <AntdLayout>
                {fileInput}
                {stepContent?.title}
                <Header
                    style={{
                        background: '#fff',
                        padding: 0,
                        height: 'auto',
                        lineHeight: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: '8px',
                        marginBottom: '10px'
                    }}
                >
                    <Operations
                        operations={OPERATIONS_ACCESSIBILITY_BY_STEP[currentStep]}
                        getOperationProps={getOperationProps}
                        tags={enabledTags ? tags : undefined}
                        maxTagsCount={MAX_TAGS_COUNT}
                        maxTagsHint={t('Move on to Step 2 to see all the chosen rows')}
                        onClose={closeTag}
                        onAllClose={clearSelectedRows}
                    />
                </Header>
                <Content>{stepContent ? stepContent.content : children}</Content>
            </AntdLayout>
        </AntdLayout>
    )
}

export default React.memo(Layout)
