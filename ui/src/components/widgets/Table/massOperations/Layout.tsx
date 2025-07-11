import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layout as AntdLayout } from 'antd'
import Steps from '@components/widgets/Table/massOperations/Steps'
import {
    AVAILABLE_MASS_STEPS,
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
import { BcFilter, OperationPostInvokeConfirm, OperationPostInvokeConfirmType, utils, WidgetListField } from '@cxbox-ui/core'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '@interfaces/operation'
import { useTranslation } from 'react-i18next'
import { AppWidgetMeta } from '@interfaces/widget'
import { postInvokeHasRefreshBc } from '@utils/postInvokeHasRefreshBc'
import { useFilterGroups } from '@components/widgets/Table/hooks/hooks'
import Confirm from '@components/widgets/Table/massOperations/Confirm/Confirm'
import { FilterType } from '@interfaces/filters'
import Title from '@components/widgets/Table/massOperations/Title'
import TitleWithResult from '@components/widgets/Table/massOperations/TiltleWithResult'
import { filterByConditions } from '@utils/filterByConditions'
import { AVAILABLE_FILE_EXTENSIONS, getColumnValuesByHeaderFromFile } from '@utils/excel'
import { openNotification } from '@components/NotificationsContainer/utils'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import { FIELDS } from '@constants'

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

    const getStep = useCallback(
        (type: 'back' | 'current' | 'next', stepSize: number = 1) => {
            const offset = type === 'back' ? -stepSize : type === 'current' ? 0 : stepSize
            const stepIndex = AVAILABLE_MASS_STEPS.findIndex(item => item === currentStep) + offset

            return AVAILABLE_MASS_STEPS[stepIndex]
        },
        [currentStep]
    )

    const moveToStep = useCallback(
        (type: MassStepType) => {
            dispatch(actions.changeOperationStep({ bcName, step: type }))
        },
        [bcName, dispatch]
    )

    const changeStep = useCallback(
        (type: 'next' | 'back', stepSize?: number) => {
            moveToStep(getStep(type, stepSize))
        },
        [getStep, moveToStep]
    )

    const cancel = useCallback(() => {
        dispatch(actions.resetViewerMode({ bcName }))
        dispatch(
            actions.bcRemoveFilter({
                bcName: bcName,
                filter: { type: 'equalsOneOf', fieldName: FIELDS.TECHNICAL.ID } as BcFilter
            })
        )
    }, [bcName, dispatch])

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

    const { clearAllFilters } = useFilterGroups(widget)

    const exportConfig = widget?.options?.export
    const { exportTable } = useExportTable({
        bcName: bcName,
        fields: widget?.fields as WidgetListField[],
        title: exportConfig?.title ?? widget?.title ?? ''
    })

    const filters = useAppSelector(state => state.screen.filters[bcName])

    const [wasOperationCall, setWasOperationCall] = useState(false)

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

    const getOperationProps = useCallback(
        (buttonType: MassOperationType) => {
            const result: { disabled?: boolean; hidden?: boolean; onClick?: () => void; hint?: string } = {}
            const visibleOperationsByStep: MassOperationType[] = []

            if (currentStep === 'Select rows') {
                visibleOperationsByStep.splice(0, 0, 'next', 'cancel', 'select-from-file')

                if (visibleOperationsByStep.includes(buttonType)) {
                    result.hidden = false
                }

                if (buttonType === 'select-from-file') {
                    result.onClick = () => {
                        selectFromFileInputRef.current?.click()
                    }
                }

                if (buttonType === 'next' && !selectedRows?.length) {
                    result.disabled = true
                }

                if (buttonType === 'next' && selectedRows?.length) {
                    result.onClick = () => {
                        dispatch(
                            actions.bcAddFilter({
                                bcName,
                                filter: {
                                    type: FilterType.equalsOneOf,
                                    value: selectedRows?.map(item => item.id),
                                    fieldName: FIELDS.TECHNICAL.ID
                                }
                            })
                        )
                        dispatch(
                            actions.bcChangeCursors({
                                cursorsMap: {
                                    [bcName]: null as any
                                }
                            })
                        )
                        dispatch(actions.bcForceUpdate({ bcName }))
                        changeStep('next')
                    }
                }

                if (buttonType === 'cancel') {
                    result.onClick = () => {
                        cancel()
                    }
                }
            }

            if (currentStep === 'Review rows') {
                visibleOperationsByStep.splice(0, 0, 'back', 'cancel')

                if (currentMassOperation) {
                    visibleOperationsByStep.push(hasMassPreInvoke ? 'next' : 'apply')
                }

                if (visibleOperationsByStep.includes(buttonType)) {
                    result.hidden = false
                }

                if (buttonType === 'back') {
                    result.onClick = () => {
                        changeStep('back')
                        clearAllFilters()
                    }
                }

                if (buttonType === 'cancel') {
                    result.onClick = () => {
                        cancel()
                    }
                }

                if (buttonType === 'next' && currentMassOperation && selectedRows?.length) {
                    result.onClick = () => {
                        dispatch(
                            actions.bcChangeCursors({
                                cursorsMap: {
                                    [bcName]: null as any
                                }
                            })
                        )
                        clearAllFilters()
                        setWasOperationCall(true)
                        moveToStep('Confirm operation')
                    }
                }

                if (buttonType === 'apply' && currentMassOperation && selectedRows?.length) {
                    result.onClick = () => {
                        clearAllFilters()
                        setWasOperationCall(true)
                    }
                }
            }

            if (currentStep === 'Confirm operation') {
                visibleOperationsByStep.splice(0, 0, 'back')

                if (visibleOperationsByStep.includes(buttonType)) {
                    result.hidden = false
                }

                if (buttonType === 'back') {
                    result.onClick = () => {
                        changeStep('back')
                        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
                        dispatch(actions.closeViewPopup({ bcName }))
                        dispatch(actions.closeConfirmModal())
                    }
                }
            }
            if (currentStep === 'View results') {
                visibleOperationsByStep.splice(0, 0, 'close', 'export', 'export-failed')

                if (visibleOperationsByStep.includes(buttonType)) {
                    result.hidden = false
                }

                if (['export-failed'].includes(buttonType)) {
                    result.hint =
                        "A file with failed rows will be downloaded. To retry the operation for these rows, upload this file on Step 1 via 'Select from File'"
                }

                if (['export', 'export-failed'].includes(buttonType)) {
                    result.onClick = () => {
                        const needFailedRows = buttonType === 'export-failed'
                        const [failRows] = needFailedRows && selectedRows ? filterByConditions(selectedRows, [item => !item.success]) : []
                        const filteredFilters = filters.filter(filter => filter.fieldName === FIELDS.TECHNICAL.ID)

                        exportTable(
                            needFailedRows
                                ? {
                                      total: failRows.length,
                                      filters: [
                                          ...filteredFilters,
                                          {
                                              fieldName: FIELDS.TECHNICAL.ID,
                                              value: failRows.map(item => item.id),
                                              type: FilterType.equalsOneOf,
                                              widgetName,
                                              viewName
                                          }
                                      ]
                                  }
                                : undefined,
                            'mass'
                        ).then(() => {
                            openNotification({
                                type: 'success',
                                message: t("File exported. To re-apply the mass operation to these rows, use 'Select from File' on Step 1.")
                            })
                        })
                    }
                }

                if (buttonType === 'close') {
                    result.onClick = () => {
                        cancel()

                        postInvoke &&
                            operationType &&
                            dispatch(
                                actions.applyPendingPostInvoke({
                                    postInvoke,
                                    bcName,
                                    operationType,
                                    widgetName
                                })
                            )
                    }
                }
            }

            return result
        },
        [
            bcName,
            cancel,
            changeStep,
            clearAllFilters,
            currentMassOperation,
            currentStep,
            dispatch,
            exportTable,
            filters,
            hasMassPreInvoke,
            moveToStep,
            operationType,
            postInvoke,
            selectedRows,
            t,
            viewName,
            widgetName
        ]
    )

    const enabledTags = currentStep === 'Select rows' && widget?.options?.massOp?.pickMapFieldKey !== null
    const popupData = useAppSelector(state => state.view.popupData)

    const getContent = () => {
        if (step === 'Confirm operation') {
            return <Confirm widgetName={popupData?.widgetName ?? widgetName} />
        }
        return children
    }

    const getResultTitle = () => {
        if (step === 'View results') {
            const [successRows, failRows] = filterByConditions(selectedRows ?? [], [
                item => item.success === true,
                item => item.success === false
            ])

            return <TitleWithResult processed={successRows.length + failRows.length} success={successRows.length} fail={failRows.length} />
        }
        return null
    }

    const selectFromFileInputRef = useRef<HTMLInputElement>(null)

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

    const steps = useMemo(() => {
        let result = MASS_STEPS.map(item => ({
            ...item,
            title: item.step && t(item.step)
        }))

        if (!currentMassOperation?.preInvoke) {
            result = result.filter(item => item.step !== 'Confirm operation')
        }

        return result
    }, [currentMassOperation?.preInvoke, t])

    return (
        <AntdLayout style={{}}>
            <Sider theme={'light'} style={{ padding: '0 10px 10px' }}>
                <Title level={2} title={t('Mass operation')} />
                <Steps currentStep={currentStep} values={steps} />
            </Sider>
            <AntdLayout>
                {fileInput}
                {getResultTitle()}
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
                <Content>{getContent()}</Content>
            </AntdLayout>
        </AntdLayout>
    )
}

export default React.memo(Layout)
