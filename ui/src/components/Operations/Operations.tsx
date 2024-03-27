import React, { useEffect, useRef } from 'react'
import { actions, interfaces } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, OperationCustomMode, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import cn from 'classnames'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'
import { FileUpload } from '@components/Operations/components/FileUpload/FileUpload'
import { Operation, OperationGroup } from '@interfaces/core'
import { buildBcUrl } from '@utils/buildBcUrl'

const { isOperationGroup, WidgetTypes } = interfaces

export interface OperationsOwnProps {
    className?: string
    bcName: string
    widgetMeta: AppWidgetMeta
    operations: Array<interfaces.Operation | interfaces.OperationGroup>
}

function Operations(props: OperationsOwnProps) {
    const { bcName, widgetMeta, operations, className } = props
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])

    const { defaultOperations, customOperations, isUploadDnDMode } = useWidgetOperationsMode(widgetMeta, operations)
    const cachedOperations = useCacheForDefaultUploadOperation(defaultOperations, bcName)

    const dispatch = useDispatch()

    const handleOperationClick = React.useCallback(
        (operation: interfaces.Operation) => {
            dispatch(
                actions.sendOperation({
                    bcName,
                    operationType: operation.type,
                    widgetName: widgetMeta.name,
                    bcKey: operation.bcKey,
                    confirmOperation: operation.preInvoke
                })
            )
        },
        [dispatch, bcName, widgetMeta]
    )

    return (
        <div className={styles.container}>
            {customOperations?.map(customOperation => {
                if (isUploadDnDMode(customOperation.mode)) {
                    return <FileUpload key={customOperation.actionKey} widget={widgetMeta} operationInfo={customOperation} mode="drag" />
                }

                return null
            })}
            <div className={cn(styles.operations, className, { [styles.empty]: !defaultOperations?.length })}>
                {cachedOperations.map((item: interfaces.Operation | interfaces.OperationGroup, index) => {
                    if (isOperationGroup(item)) {
                        return (
                            <OperationsGroup
                                key={item.type}
                                group={item}
                                widgetType={widgetMeta.type}
                                onClick={handleOperationClick}
                                loading={metaInProgress}
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
                            loading={metaInProgress}
                        >
                            {item.icon && <Icon type={item.icon} />}
                            {item.text}
                        </Button>
                    )
                })}
                {widgetMeta.options?.fullTextSearch?.enabled && (
                    <TextSearchInput
                        bcName={bcName}
                        widgetName={widgetMeta.name}
                        placeholder={widgetMeta.options?.fullTextSearch?.placeholder}
                    />
                )}
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
        return customTypes.formOperationYellow
    }

    return defaultType
}

const CUSTOM_COMBINED_WITH_DEFAULT_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd']
const FILE_UPLOAD_DND_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd', 'file-upload-dnd']

const useWidgetOperationsMode = (widget: AppWidgetMeta, operations: (interfaces.Operation | interfaces.OperationGroup)[]) => {
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
