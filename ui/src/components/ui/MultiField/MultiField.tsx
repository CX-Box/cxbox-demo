import React from 'react'
import styles from './MultiField.less'
import Field from '@components/Field/Field'
import cn from 'classnames'
import { DataItem } from '@cxbox-ui/core'
import { WidgetField } from '@interfaces/widget'

export interface MultiFieldProps {
    bcName: string
    fields: WidgetField[]
    data: DataItem
    cursor: string
    widgetName: string
    style: 'inline' | 'list'
}

/**
 *
 * @param props
 * @category Components
 */
const MultiField: React.FunctionComponent<MultiFieldProps> = props => {
    const valuesStyle = props.style === 'list' ? styles.listValues : styles.inlineValues
    const valueStyle = props.style === 'list' ? styles.listValue : styles.inlineValue
    const multiValueStyle = props.style !== 'list' && styles.inlineMultiValue

    return (
        <div className={valuesStyle}>
            {props.fields.map(fieldMeta => {
                const data = props.data?.[fieldMeta.key]

                return data || data === 0 ? (
                    <div
                        key={fieldMeta.key}
                        className={valueStyle}
                        data-test="FIELD"
                        data-test-field-type={fieldMeta.type}
                        data-test-field-title={fieldMeta.label || fieldMeta.title}
                        data-test-field-key={fieldMeta.key}
                    >
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={fieldMeta}
                            className={cn(multiValueStyle)}
                            readonly
                        />
                    </div>
                ) : null
            })}
        </div>
    )
}

export default React.memo(MultiField)
