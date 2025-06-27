import React, { useCallback, useMemo, useRef } from 'react'
import { Icon, Select as AntdSelect, Tooltip } from 'antd'
import { BaseFieldProps } from '@components/Field/Field'
import { interfaces } from '@cxbox-ui/core'
import styles from './Dictionary.module.css'
import { opacitySuffix } from '@constants'
import { RowMeta } from '@cxbox-ui/core'
import Select, { SelectProps } from '@components/ui/Select/Select'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import * as dictionaryCustomIcons from '@assets/icons/dictionaryCustomIcons'
import { AppDictionaryFieldMeta, EDictionaryMode } from '@interfaces/widget'
import cn from 'classnames'
import useFixSelectDropdownForTableScroll from '@hooks/useFixSelectDropdownForTableScroll'
import DrillDown from '@components/ui/DrillDown/DrillDown'

export interface DictionaryProps extends BaseFieldProps {
    value?: interfaces.MultivalueSingleValue[] | string | null
    onChange?: (value: interfaces.MultivalueSingleValue[] | string) => void
    fieldName: string
    placeholder?: string
    style?: React.CSSProperties
    metaIcon?: JSX.Element
    valueIcon?: string
    popupContainer?: HTMLElement
    multiple?: boolean
    meta: AppDictionaryFieldMeta
}

const Dictionary: React.FC<DictionaryProps> = props => {
    const { multiple, onChange, value, valueIcon, meta, metaIcon, readOnly, backgroundColor, onDrillDown, widgetName } = props
    const bcName = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName)?.bcName)
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => bcName && bcUrl && state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMeta = (rowMeta as RowMeta)?.fields.find(field => field.key === meta?.key)
    const values = useMemo(() => {
        return rowFieldMeta?.values?.map(valuesItem => ({
            ...valuesItem,
            icon: rowFieldMeta?.allValues?.find(allValuesItem => allValuesItem.value === valuesItem.value)?.icon
        }))
    }, [rowFieldMeta?.allValues, rowFieldMeta?.values])

    const selectRef = useRef<AntdSelect<string | string[]>>(null)

    const handleChange = useCallback(
        (v: string | string[]) => {
            if (multiple) {
                onChange?.((v as string[]).map(item => ({ id: item, value: item })))
            } else {
                onChange?.((v as string) || '')
            }
        },
        [multiple, onChange]
    )

    const resultValue = useMemo(() => {
        if (multiple) {
            return (value as interfaces.MultivalueSingleValue[])?.map(i => i.value) ?? []
        } else {
            return value ?? undefined
        }
    }, [value, multiple])

    const extendedProps: SelectProps<string | string[]> = {
        ...props,
        mode: multiple ? 'multiple' : 'default',
        value: resultValue as string | string[],
        allowClear: !!value,
        showSearch: true,
        getPopupContainer: trigger => trigger.parentElement as HTMLElement,
        onDropdownVisibleChange: useFixSelectDropdownForTableScroll(selectRef),
        onChange: handleChange,
        dropdownMatchSelectWidth: false,
        forwardedRef: selectRef,
        suffixIcon: <Icon type="down" data-test-field-dictionary-popup={true} />,
        clearIcon: <Icon type="close-circle" theme="filled" data-test-field-dictionary-item-clear={true} />
    }

    const options = useMemo(() => {
        const noValues = !values?.length
        const hasMultipleValue = noValues && multiple && value?.length
        const hasSingleValue = noValues && !multiple && value
        if (hasMultipleValue) {
            return (value as interfaces.MultivalueSingleValue[])?.map(item => {
                return (
                    <Select.Option key={item.value} title={item.value}>
                        {item.options?.icon && getIconByParams(item.options.icon)}
                        <span data-test-field-dictionary-item={true}>{item.value}</span>
                    </Select.Option>
                )
            })
        }
        if (hasSingleValue) {
            return (
                <Select.Option key={value as string} title={value as string}>
                    {metaIcon}
                    {valueIcon && getIconByParams(valueIcon)}
                    <span data-test-field-dictionary-item={true}>{value}</span>
                </Select.Option>
            )
        }

        return values?.map(item => {
            const icon = item.icon && getIconByParams(item.icon)
            return meta.mode === EDictionaryMode.icon ? (
                <Select.Option key={item.value}>
                    <Tooltip title={item.value} placement="top">
                        {icon}
                    </Tooltip>
                </Select.Option>
            ) : (
                <Select.Option key={item.value} title={item.value}>
                    {icon} <span data-test-field-dictionary-item={true}>{item.value}</span>
                </Select.Option>
            )
        })
    }, [values, multiple, value, metaIcon, valueIcon, meta.mode])

    if (readOnly) {
        const iconParams = values?.find(item => item.value === value)?.icon
        const icon = getIconByParams(iconParams)
        const isIconMode = meta.mode === EDictionaryMode.icon

        const valueComponent = isIconMode ? (
            <Tooltip className={styles.iconTooltip} title={value} placement="top">
                {icon}
            </Tooltip>
        ) : (
            <span>
                {icon} {value}
            </span>
        )

        return (
            <div
                className={cn(props.className, styles.root, styles.readOnly, {
                    [styles.coloredValue]: !!backgroundColor,
                    [styles.onlyIcon]: isIconMode
                })}
                style={backgroundColor ? { color: backgroundColor, backgroundColor: `${backgroundColor}${opacitySuffix}` } : undefined}
                data-test-field-value={true}
            >
                {onDrillDown ? (
                    <DrillDown
                        displayedValue={valueComponent}
                        meta={meta}
                        widgetName={widgetName}
                        cursor={props.cursor}
                        onDrillDown={onDrillDown}
                    />
                ) : (
                    valueComponent
                )}
            </div>
        )
    }

    return <Select {...extendedProps}>{options}</Select>
}

export default React.memo(Dictionary)

/**
 * Returns Icon component
 *
 * @param params Contains `type` and `color`
 * @param extraStyleClasses extra css classes
 */
export function getIconByParams(params?: string, extraStyleClasses?: string) {
    if (params) {
        const [iconType, cssColor] = params.split(' ')
        const CustomIcon = dictionaryCustomIcons[iconType as keyof typeof dictionaryCustomIcons]
        return <Icon component={CustomIcon} type={iconType} style={{ color: cssColor }} className={extraStyleClasses} />
    }
    return null
}
