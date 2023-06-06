import React from 'react'
import { Icon, Select as AntdSelect } from 'antd'
import { BaseFieldProps } from '@teslerComponents/Field/Field'
import { MultivalueSingleValue } from '@tesler-ui/core'
import Select, { SelectProps } from '@teslerComponents/ui/Select/Select'
import ReadOnlyField from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField'

export interface DictionaryProps extends BaseFieldProps {
    value?: MultivalueSingleValue[] | string | null
    onChange?: (value: MultivalueSingleValue[] | string) => void
    values: Array<{ value: string; icon?: string }>
    fieldName: string
    placeholder?: string
    style?: React.CSSProperties
    metaIcon?: JSX.Element
    valueIcon?: string
    popupContainer?: HTMLElement
    multiple?: boolean
}

/**
 *
 * @param props
 * @category Components
 */
const Dictionary: React.FunctionComponent<DictionaryProps> = props => {
    const { multiple, onChange, values, value, valueIcon, meta, metaIcon, readOnly, className, backgroundColor, onDrillDown, widgetName } =
        props
    const selectRef = React.useRef<AntdSelect<string>>(null)

    const handleOnChange = React.useCallback(
        (v: string | string[]) => {
            if (multiple) {
                onChange((v as string[]).map(item => ({ id: item, value: item })))
            } else {
                onChange((v as string) || '')
            }
        },
        [multiple, onChange]
    )

    const resultValue = React.useMemo(() => {
        if (multiple) {
            return (value as MultivalueSingleValue[])?.map(i => i.value) ?? []
        } else {
            return value ?? undefined
        }
    }, [value, multiple])

    const extendedProps: SelectProps = {
        ...props,
        mode: multiple ? 'multiple' : 'default',
        value: resultValue as string | string[],
        allowClear: !!value,
        showSearch: true,
        onChange: handleOnChange,
        dropdownMatchSelectWidth: false,
        getPopupContainer: trigger => trigger.parentElement,
        forwardedRef: selectRef
    }

    const options = React.useMemo(() => {
        const noValues = !values?.length
        const hasMultipleValue = noValues && multiple && value?.length
        const hasSingleValue = noValues && !multiple && value
        if (hasMultipleValue) {
            return (value as MultivalueSingleValue[])?.map(item => {
                return (
                    <Select.Option key={item.value} title={item.value}>
                        {item.options?.icon && getIconByParams(item.options.icon)}
                        <span>{item.value}</span>
                    </Select.Option>
                )
            })
        }
        if (hasSingleValue) {
            return (
                <Select.Option key={value as string} title={value as string}>
                    {metaIcon}
                    {valueIcon && getIconByParams(valueIcon)}
                    <span>{value}</span>
                </Select.Option>
            )
        }
        return values?.map(item => {
            return (
                <Select.Option key={item.value} title={item.value}>
                    {item.icon && getIconByParams(item.icon)}
                    <span>{item.value}</span>
                </Select.Option>
            )
        })
    }, [value, values, multiple, metaIcon, valueIcon])

    if (readOnly) {
        let readOnlyValue = value ?? ''
        if (multiple) {
            readOnlyValue = (readOnlyValue as MultivalueSingleValue[]).map(i => i.value).join(', ')
        }
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

    return <Select {...extendedProps}>{options}</Select>
}

/**
 * Returns Icon component
 *
 * @param params Contains `type` and `color`
 * @param extraStyleClasses extra css classes
 */
export function getIconByParams(params: string, extraStyleClasses?: string) {
    if (params) {
        const [antIconType, cssColor] = params.split(' ')
        return <Icon type={antIconType} style={{ color: cssColor }} className={extraStyleClasses} />
    }
    return null
}

/**
 * @category Components
 */
const MemoizedDictionary = React.memo(Dictionary)

export default MemoizedDictionary
