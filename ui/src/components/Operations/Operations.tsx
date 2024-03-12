import React from 'react'
import { actions, interfaces } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import cn from 'classnames'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'
import { FileUpload } from '@components/Operations/components/FileUpload/FileUpload'

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
    const dispatch = useDispatch()

    const customOperations = widgetMeta.options?.buttons?.filter(button => button.key && button.mode?.length && button.mode !== 'default')
    const customOperationsKeys = customOperations?.map(button => button.key)

    const defaultOperations = useWidgetOperations(operations, widgetMeta).filter(
        item => !customOperationsKeys?.includes(item.type as string)
    )

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

    const uploadDnDOperation = customOperations?.find(customOperation => customOperation.mode === 'file-upload-dnd')

    return (
        <div className={styles.container}>
            {uploadDnDOperation && <FileUpload widget={widgetMeta} operationInfo={uploadDnDOperation} mode="drag" />}
            <div className={cn(styles.operations, className, { [styles.empty]: !defaultOperations?.length })}>
                {metaInProgress ? (
                    <Button loading />
                ) : (
                    defaultOperations.map((item: interfaces.Operation | interfaces.OperationGroup, index) => {
                        if (isOperationGroup(item)) {
                            return (
                                <OperationsGroup key={item.type} group={item} widgetType={widgetMeta.type} onClick={handleOperationClick} />
                            )
                        }

                        if (item.subtype === 'multiFileUpload') {
                            return (
                                <FileUpload
                                    widget={widgetMeta}
                                    operationInfo={widgetMeta.options?.buttons?.find(button => button.key === item.type)}
                                    mode="default"
                                >
                                    <Button
                                        key={item.type}
                                        data-test-widget-action-item={true}
                                        type={getButtonType({ widgetType: widgetMeta.type, index })}
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
                            >
                                {item.icon && <Icon type={item.icon} />}
                                {item.text}
                            </Button>
                        )
                    })
                )}
                {widgetMeta.options?.fullTextSearch?.enabled && (
                    <TextSearchInput bcName={bcName} placeholder={widgetMeta.options?.fullTextSearch?.placeholder} />
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
