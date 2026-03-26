import React, { ReactNode } from 'react'
import { isOperationGroup, WidgetTypes } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, OperationCustomMode, OperationInfo, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import cn from 'classnames'
import { useWidgetOperationsOld } from '@hooks/useWidgetOperations'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'
import OperationsFileUpload from './components/OperationsFileUpload'
import { actions } from '@actions'
import { AVAILABLE_MASS_STEPS } from '@components/widgets/Table/massOperations/constants'
import { Operation, OperationGroup } from '@interfaces/rowMeta'
import { useStaleValueWhileRowMetaLoading } from '@hooks/useStaleValueWhileRowMetaLoading'

export interface OperationsProps {
    className?: string
    bcName: string
    widgetMeta: AppWidgetMeta
    operations: Array<Operation | OperationGroup> | undefined
    additionalOperations?: ReactNode
}

function Operations(props: OperationsProps) {
    const { bcName, widgetMeta, operations = [], className, additionalOperations } = props
    const bcData = useAppSelector(state => {
        return state.data[bcName]
    })
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])

    const { defaultOperations, customOperations, operationsInfo, isUploadDnDMode, hasOperations, getOperationInfo } =
        useWidgetOperationsMode(widgetMeta, operations)

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

    if (!hasOperations && !additionalOperations && !widgetMeta.options?.fullTextSearch?.enabled) {
        return null
    }

    return (
        <div className={styles.container}>
            {customOperations?.map(customOperation => {
                const operationInfo = getOperationInfo(customOperation.type)

                if (isUploadDnDMode(operationInfo?.mode)) {
                    return (
                        <OperationsFileUpload
                            key={customOperation.type}
                            item={customOperation}
                            widgetMeta={widgetMeta}
                            operationInfo={operationInfo!}
                            mode="drag"
                        />
                    )
                }

                return null
            })}
            <div className={cn(styles.operations, className, { [styles.empty]: !defaultOperations?.length })}>
                {defaultOperations.map((item: Operation | OperationGroup, index) => {
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
                                bgColor={item.customParameter?.platformBgColor}
                            />
                        )
                    }

                    if (item.subtype === 'multiFileUpload') {
                        const operationInfo: OperationInfo = getOperationInfo(item.type) ?? {
                            actionKey: item.type
                        }

                        return (
                            <OperationsFileUpload
                                key={item.type}
                                item={item}
                                widgetMeta={widgetMeta}
                                operationInfo={operationInfo}
                                buttonType={getButtonType({
                                    widgetType: widgetMeta.type,
                                    index,
                                    bgColor: item.customParameter?.platformBgColor
                                })}
                                loading={metaInProgress}
                                {...getButtonProps?.(item)}
                            />
                        )
                    }

                    return removeRecordOperationWidgets.includes(widgetMeta.type) && item.scope === 'record' ? null : (
                        <Button
                            key={item.type}
                            data-test-widget-action-item={true}
                            type={getButtonType({ widgetType: widgetMeta.type, index })}
                            onClick={() => handleOperationClick(item)}
                            loading={metaInProgress || isOperationInProgress(item.type)}
                            bgColor={item.customParameter?.platformBgColor}
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

const getButtonType = ({
    widgetType,
    index,
    defaultType,
    bgColor
}: {
    widgetType?: string
    defaultType?: string
    index: number
    bgColor?: string
}) => {
    if (bgColor) {
        return customTypes.customDefault
    }

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
    const operationsInfo = widget.options?.buttons?.filter(button => button.actionKey && button.mode?.length)
    const customOperationsInfo = widget.options?.buttons?.filter(button => button.mode !== 'default')

    const customOperationsKeys = customOperationsInfo?.map(button => button.actionKey)
    const customOperationsWithoutDefaultModeKeys = customOperationsInfo
        ?.filter(button => !CUSTOM_COMBINED_WITH_DEFAULT_MODE.includes(button.mode as OperationCustomMode))
        .map(button => button.actionKey)

    const allOperations = useWidgetOperationsOld(operations, widget)
    const defaultOperations = allOperations.filter(item => !customOperationsWithoutDefaultModeKeys?.includes(item.type as string))
    const customOperations = allOperations
        .flatMap(operationOrGroup => (isOperationGroup(operationOrGroup) ? operationOrGroup.actions : [operationOrGroup]))
        .filter(item => customOperationsKeys?.includes(item.type as string))

    const isUploadDnDMode = (mode?: OperationCustomMode | string) => {
        return FILE_UPLOAD_DND_MODE.includes(mode as OperationCustomMode)
    }

    const cachedDefaultOperations = useStaleValueWhileRowMetaLoading(defaultOperations, widget.bcName)
    const cachedCustomOperations = useStaleValueWhileRowMetaLoading(customOperations, widget.bcName)
    const cachedOperationsInfo = useStaleValueWhileRowMetaLoading(operationsInfo, widget.bcName)
    const cachedHasOperations = !!(cachedCustomOperations?.length || cachedDefaultOperations?.length)

    const getOperationInfo = (operationType: string | undefined) => cachedOperationsInfo?.find(info => info.actionKey === operationType)

    return {
        hasOperations: cachedHasOperations,
        defaultOperations: cachedDefaultOperations,
        customOperations: cachedCustomOperations,
        operationsInfo: cachedOperationsInfo,
        isUploadDnDMode,
        getOperationInfo
    }
}
