import React from 'react'
import { Radio } from 'antd'
import { RadioChangeEvent } from 'antd/es/radio'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'
import { getIconByParams } from '@cxboxComponents/ui/Dictionary/Dictionary'

export interface RadioButtonProps extends BaseFieldProps {
    value?: string | null
    onChange?: (value: string) => void
    values: Array<{ value: string; icon?: string }>
    style?: React.CSSProperties
}

/**
 *
 * @param props
 * @category Components
 */
const RadioButton: React.FunctionComponent<RadioButtonProps> = ({
    value,
    values,
    style,
    readOnly,
    widgetName,
    meta,
    className,
    backgroundColor,
    disabled,
    onChange,
    onDrillDown
}) => {
    const handleOnChange = React.useCallback(
        (e: RadioChangeEvent) => {
            let newValue: string

            if (values) {
                const valueId = Number(e.target.value)
                newValue = values[valueId]?.value
                onChange?.(newValue || '')
            }
        },
        [values, onChange]
    )

    let valueIndex: number = -1

    if (value && values) {
        valueIndex = values.findIndex(v => v.value === value)
    }

    if (readOnly) {
        const readOnlyValue = value ?? ''

        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {readOnlyValue}
            </ReadOnlyField>
        )
    }

    return (
        <Radio.Group
            onChange={handleOnChange}
            disabled={disabled}
            value={valueIndex >= 0 ? valueIndex.toString() : value}
            className={className}
        >
            {values?.map((el, index) => (
                <Radio value={index.toString()} key={index}>
                    <span>
                        {el.icon && getIconByParams(el.icon)}
                        <span data-test-field-radiobutton-item={true}>{el.value}</span>
                    </span>
                </Radio>
            ))}
        </Radio.Group>
    )
}

/**
 * @category Components
 */
const MemoizedRadioButton = React.memo(RadioButton)

export default MemoizedRadioButton
