import React from 'react'
import { $do, useWidgetOperations } from '@cxbox-ui/core'
import { isOperationGroup, Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import { WidgetMeta, WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import { Icon } from 'antd'
import { AppState } from '../../interfaces/storeSlices'
import styles from './Operations.less'
import { useDispatch, useSelector } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { removeRecordOperationWidgets } from '../../interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import { ExportButton } from './components/ExportButton/ExportButton'
import cn from 'classnames'

export interface OperationsOwnProps {
    className?: string
    bcName: string
    widgetMeta: WidgetMeta
    operations: Array<Operation | OperationGroup>
}

function Operations(props: OperationsOwnProps) {
    const { bcName, widgetMeta, operations, className } = props
    const metaInProgress = useSelector((store: AppState) => store.view.metaInProgress[bcName])
    const dispatch = useDispatch()
    const currentOperations = useWidgetOperations(operations, widgetMeta).filter(item => item.type !== 'file-upload-save')
    const handleOperationClick = React.useCallback(
        (operation: Operation) => {
            dispatch(
                $do.sendOperation({
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
        <div className={cn(styles.container, className, { [styles.empty]: !currentOperations?.length })}>
            {metaInProgress ? (
                <Button loading />
            ) : (
                <>
                    {currentOperations.map((item: Operation | OperationGroup, index) => {
                        if (isOperationGroup(item)) {
                            return (
                                <OperationsGroup key={item.type} group={item} widgetType={widgetMeta.type} onClick={handleOperationClick} />
                            )
                        }
                        return removeRecordOperationWidgets.includes(widgetMeta.type) && item.scope === 'record' ? null : (
                            <Button
                                key={item.type}
                                type={getButtonType({ widgetType: widgetMeta.type, index })}
                                onClick={() => handleOperationClick(item)}
                            >
                                {item.icon && <Icon type={item.icon} />}
                                {item.text}
                            </Button>
                        )
                    })}
                    <ExportButton widgetMeta={widgetMeta} />
                </>
            )}
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
