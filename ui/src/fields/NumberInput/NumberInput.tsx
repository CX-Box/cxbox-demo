import React from 'react'
import { NumberTypes } from './formaters'
import CoreNumberInput from './CoreNumberInput'
import styles from './Number.less'
import { NumberFieldMeta } from '@cxbox-ui/core'

interface NumberProps {
    value: number
    meta: NumberFieldMeta
    widgetName: string
    onChange?: (value: number) => void
    readOnly: boolean
}

export const Number = ({ widgetName, value, readOnly, onChange, meta, ...rest }: NumberProps) => {
    const type = meta.type as unknown as NumberTypes
    return (
        <div className={styles.number}>
            <CoreNumberInput
                value={value}
                type={type}
                digits={meta.digits}
                nullable={meta.nullable}
                onChange={onChange}
                readOnly={readOnly}
                {...rest}
            />
        </div>
    )
}
