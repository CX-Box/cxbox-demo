import React, { ReactNode, useEffect, useRef } from 'react'
import { isOperationGroup, WidgetTypes, Operation, OperationGroup } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, OperationCustomMode, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import cn from 'classnames'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'
import { FileUpload } from '@components/Operations/components/FileUpload/FileUpload'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { AVAILABLE_MASS_STEPS } from '@components/widgets/Table/massOperations/constants'

export interface OperationsOwnProps {
    className?: string
    bcName: string
    widgetMeta: AppWidgetMeta
    operations: Array<Operation | OperationGroup> | undefined
    additionalOperations?: ReactNode
}

function Operations(props: OperationsOwnProps) {
    const { bcName, widgetMeta, operations = [], className, additionalOperations } = props
    const bcData = useAppSelector(state => {
        return state.data[bcName]
    })
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])

    const { defaultOperations, customOperations, isUploadDnDMode } = useWidgetOperationsMode(widgetMeta, operations)
    const cachedOperations = useCacheForDefaultUploadOperation(defaultOperations, bcName)
    const isOperationInProgress = useOperationInProgress(bcName)

    const dispatch = useDispatch()

    const handleOperationClick = React.useCallback(
        (operation: Operation) => {
            if (operation.scope === 'mass') {
                dispatch(
                    actions.setViewerMode({
                        bcName,
                        operationType: operation.type,
                        widgetName: widgetMeta.name,
                        mode: operation.scope,
                        step: AVAILABLE_MASS_STEPS[0]
                    })
                )
            } else {
                dispatch(
                    actions.sendOperation({
                        bcName,
                        operationType: operation.type,
                        widgetName: widgetMeta.name,
                        bcKey: operation.bcKey,
                        confirmOperation: operation.preInvoke
                    })
                )
            }
        },
        [dispatch, bcName, widgetMeta]
    )

    const getButtonProps = (operation: Operation) => {
        return {
            disabled: operation.scope === 'mass' ? !bcData?.length : false
        }
    }

    return (
        <div className={styles.container}>
            {customOperations?.map(customOperation => {
                if (isUploadDnDMode(customOperation.mode)) {
                    return <FileUpload key={customOperation.actionKey} widget={widgetMeta} operationInfo={customOperation} mode="drag" />
                }

                return null
            })}
            <div className={cn(styles.operations, className, { [styles.empty]: !defaultOperations?.length })}>
                {cachedOperations.map((item: Operation | OperationGroup, index) => {
                    if (isOperationGroup(item)) {
                        return (
                            <OperationsGroup
                                key={item.type}
                                isOperationInProgress={isOperationInProgress}
                                group={item}
                                widgetType={widgetMeta.type}
                                onClick={handleOperationClick}
                                loading={metaInProgress}
                                getButtonProps={getButtonProps}
                            />
                        )
                    }

                    if (item.subtype === 'multiFileUpload') {
                        return (
                            <FileUpload
                                key={item.type}
                                widget={widgetMeta}
                                operationInfo={widgetMeta.options?.buttons?.find(button => button.actionKey === item.type)}
                                mode="default"
                            >
                                <Button
                                    key={item.type}
                                    data-test-widget-action-item={true}
                                    type={getButtonType({ widgetType: widgetMeta.type, index })}
                                    loading={metaInProgress}
                                    {...getButtonProps?.(item)}
                                >
                                    {item.icon && <Icon type={item.icon} />}
                                    {item.text}
                                </Button>
                            </FileUpload>
                        )
                    }

                    return removeRecordOperationWidgets.includes(widgetMeta.type) && item.scope === 'record' ? null : (
                        <Button
                            key={item.type}
                            data-test-widget-action-item={true}
                            type={getButtonType({ widgetType: widgetMeta.type, index })}
                            onClick={() => handleOperationClick(item)}
                            loading={metaInProgress || isOperationInProgress(item.type)}
                            {...getButtonProps(item)}
                        >
                            {item.icon && <Icon type={item.icon} />}
                            {item.text}
                        </Button>
                    )
                })}
                <div className={styles.operationsLeftBlock}>
                    {widgetMeta.options?.fullTextSearch?.enabled && (
                        <TextSearchInput
                            bcName={bcName}
                            widgetName={widgetMeta.name}
                            placeholder={widgetMeta.options?.fullTextSearch?.placeholder}
                        />
                    )}
                    {additionalOperations}
                </div>
            </div>
        </div>
    )
}

export default React.memo(Operations)

const getButtonType = ({ widgetType, index, defaultType }: { widgetType?: string; defaultType?: string; index: number }) => {
    const isFormWidget = widgetType === WidgetTypes.Form

    if (isFormWidget && index !== 0) {
        return customTypes.formOperation
    }

    if (isFormWidget && index === 0) {
        return customTypes.formOperationRed
    }

    return defaultType
}

const CUSTOM_COMBINED_WITH_DEFAULT_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd']
const FILE_UPLOAD_DND_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd', 'file-upload-dnd']

const useWidgetOperationsMode = (widget: AppWidgetMeta, operations: (Operation | OperationGroup)[]) => {
    const customOperations = widget.options?.buttons?.filter(button => button.actionKey && button.mode?.length && button.mode !== 'default')

    const customOperationsWithoutDefaultMode = customOperations
        ?.filter(button => !CUSTOM_COMBINED_WITH_DEFAULT_MODE.includes(button.mode as OperationCustomMode))
        .map(button => button.actionKey)

    const defaultOperations = useWidgetOperations(operations, widget).filter(
        item => !customOperationsWithoutDefaultMode?.includes(item.type as string)
    )

    const getCustomOperationByMode = (mode: OperationCustomMode | string) => {
        return customOperations?.find(customOperation => customOperation.mode === mode)
    }

    const isUploadDnDMode = (mode?: OperationCustomMode | string) => {
        return FILE_UPLOAD_DND_MODE.includes(mode as OperationCustomMode)
    }

    return {
        defaultOperations,
        customOperations,
        getOperationByMode: getCustomOperationByMode,
        isUploadDnDMode
    }
}
/**
 *  Решает проблему с потерей состояния FileUpload из-за metaInProgress, исчезновения rowMeta при перезагрузке страницы и хука useWidgetOperations, который всегда возвращает массив вместо undefined.
 */
const useCacheForDefaultUploadOperation = (defaultOperations: (OperationGroup | Operation)[], bcName: string) => {
    const cachedMultiFileUpload = useRef<Operation | null>(null)

    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])
    const existRowMeta = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true)
        return Array.isArray(state.view.rowMeta[bcName]?.[bcUrl]?.actions)
    })

    useEffect(() => {
        const multiFileUpload = defaultOperations.find(item => (item as Operation).subtype === 'multiFileUpload')

        if (!metaInProgress && multiFileUpload && cachedMultiFileUpload.current === null) {
            cachedMultiFileUpload.current = multiFileUpload as Operation
        } else if (!metaInProgress && multiFileUpload && multiFileUpload !== cachedMultiFileUpload.current) {
            cachedMultiFileUpload.current = multiFileUpload as Operation
        } else if (!metaInProgress && existRowMeta && cachedMultiFileUpload && !multiFileUpload) {
            cachedMultiFileUpload.current = null
        }
    }, [cachedMultiFileUpload, defaultOperations, existRowMeta, metaInProgress])

    if (defaultOperations.length === 0 && cachedMultiFileUpload.current) {
        return [...defaultOperations, cachedMultiFileUpload.current]
    }

    return defaultOperations
}
