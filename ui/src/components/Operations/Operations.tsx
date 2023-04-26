import React from 'react'
import { $do, useWidgetOperations } from '@cxbox-ui/core'
import { isOperationGroup, Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import { Button, Icon } from 'antd'
import { AppState } from '../../interfaces/storeSlices'
import styles from './Operations.module.css'
import OperationButton from '../ui/OperationButton/OperationButton'
import { useDispatch, useSelector } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { removeRecordOperationWidgets } from '../../interfaces/widget'

export interface OperationsOwnProps {
    bcName: string
    widgetMeta: WidgetMeta
    operations: Array<Operation | OperationGroup>
}

function Operations(props: OperationsOwnProps) {
    const { bcName, widgetMeta, operations } = props
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
        <div className={styles.container}>
            {metaInProgress ? (
                <Button loading type="link" className={styles.loading} />
            ) : (
                currentOperations.map((item: Operation | OperationGroup) => {
                    if (isOperationGroup(item)) {
                        return <OperationsGroup key={item.type} group={item} widgetType={widgetMeta.type} onClick={handleOperationClick} />
                    }
                    return removeRecordOperationWidgets.includes(widgetMeta.type) && item.scope === 'record' ? null : (
                        <OperationButton key={item.type} onClick={() => handleOperationClick(item)}>
                            {item.icon && <Icon type={item.icon} />}
                            {item.text}
                        </OperationButton>
                    )
                })
            )}
        </div>
    )
}

export default React.memo(Operations)
