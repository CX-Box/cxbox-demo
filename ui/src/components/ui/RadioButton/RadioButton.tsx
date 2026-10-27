import React from 'react'
import { Radio } from 'antd'
import { RadioChangeEvent } from 'antd/es/radio'
import { BaseFieldProps } from '@components/Field/Field'
import ReadOnlyField from '@components/ui/ReadOnlyField/ReadOnlyField'
import { getIconByParams } from '@fields/Dictionary/Dictionary'
import { AppRadioButtonFieldMeta } from '@interfaces/widget'
import cn from 'classnames'
import { radioButtonConsts } from '@components/ui/RadioButton/constants'
import TextClampWrapper from '@components/TextClampWrapper/TextClampWrapper'
import styles from './RadioButton.less'

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
    cursor,
    onDrillDown
}) => {
    const fieldMeta = meta as AppRadioButtonFieldMeta

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
        const showMaxRows = fieldMeta.maxRowsPerValue || radioButtonConsts.maxRowsPerValue

        return (
            <TextClampWrapper maxRows={showMaxRows}>
                <ReadOnlyField
                    widgetName={widgetName}
                    meta={meta}
                    className={className}
                    backgroundColor={backgroundColor}
                    cursor={cursor}
                    onDrillDown={onDrillDown}
                >
                    {readOnlyValue}
                </ReadOnlyField>
            </TextClampWrapper>
        )
    }

    const showEditMaxRows = fieldMeta.editMaxRowsPerValue || radioButtonConsts.editMaxRowsPerValue

    return (
        <Radio.Group
            onChange={handleOnChange}
            disabled={disabled}
            value={valueIndex >= 0 ? valueIndex.toString() : value}
            className={className}
        >
            {values?.map((el, index) => (
                <Radio
                    key={index}
                    className={cn({
                        [styles.verticalRadioButton]: fieldMeta.displayMode === 'vertical'
                    })}
                    value={index.toString()}
                >
                    <span>
                        {el.icon && getIconByParams(el.icon)}
                        <span data-test-field-radiobutton-item={true}>
                            <TextClampWrapper maxRows={showEditMaxRows}>{el.value}</TextClampWrapper>
                        </span>
                    </span>
                </Radio>
            ))}
        </Radio.Group>
    )
}

export default React.memo(RadioButton)
