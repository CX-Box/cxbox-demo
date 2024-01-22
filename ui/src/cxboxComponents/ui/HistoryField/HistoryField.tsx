import React from 'react'
import Field from '@cxboxComponents/Field/Field'
import styles from './HistoryField.less'
import { diffWords } from 'diff'
import cn from 'classnames'
import { interfaces } from '@cxbox-ui/core'

const { FieldType } = interfaces

export interface HistoryFieldProps {
    fieldMeta: interfaces.WidgetField
    data: interfaces.DataItem
    bcName: string
    cursor: string
    widgetName: string
}

/**
 *
 * @param props
 * @category Components
 */
const HistoryField: React.FunctionComponent<HistoryFieldProps> = props => {
    const prevValue = ((props.fieldMeta.snapshotKey && props.data?.[props.fieldMeta.snapshotKey]) || '').toString()
    const currentValue = (props.data?.[props.fieldMeta.key] || '').toString()

    if (props.fieldMeta.type === FieldType.text) {
        return (
            <div>
                {diffWords(prevValue, currentValue || '').map((item, index) => {
                    return (
                        <span
                            key={index}
                            className={cn({
                                [styles.addedWord]: item.added,
                                [styles.removedWord]: item.removed
                            })}
                        >
                            {item.value}
                        </span>
                    )
                })}
            </div>
        )
    }

    if (prevValue === currentValue) {
        return (
            <Field
                bcName={props.bcName}
                cursor={props.cursor}
                widgetName={props.widgetName}
                widgetFieldMeta={props.fieldMeta}
                readonly
                historyMode
            />
        )
    }

    return (
        <div className={styles.container}>
            {prevValue && (
                <div>
                    <div className={styles.prevValue}>
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={props.fieldMeta}
                            readonly
                            historyMode
                            forcedValue={prevValue}
                            disableDrillDown
                        />
                    </div>
                </div>
            )}
            {currentValue && (
                <div>
                    <div className={styles.newValue}>
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={props.fieldMeta}
                            readonly
                            historyMode
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedHistoryField = React.memo(HistoryField)

export default MemoizedHistoryField
