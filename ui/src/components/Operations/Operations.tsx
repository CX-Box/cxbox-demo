import React from 'react'
import { actions, interfaces } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import { ExportButton } from './components/ExportButton/ExportButton'
import cn from 'classnames'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'

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
    const currentOperations = useWidgetOperations(operations, widgetMeta).filter(item => item.type !== 'file-upload-save')
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
        <div className={cn(styles.container, className, { [styles.empty]: !currentOperations?.length })}>
            {metaInProgress ? (
                <Button loading />
            ) : (
                <>
                    {currentOperations.map((item: interfaces.Operation | interfaces.OperationGroup, index) => {
                        if (isOperationGroup(item)) {
                            return (
                                <OperationsGroup key={item.type} group={item} widgetType={widgetMeta.type} onClick={handleOperationClick} />
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
                    })}
                    <ExportButton widgetMeta={widgetMeta} />
                </>
            )}
            {widgetMeta.options?.fullTextSearch?.enabled && (
                <TextSearchInput bcName={bcName} placeholder={widgetMeta.options?.fullTextSearch?.placeholder} />
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
