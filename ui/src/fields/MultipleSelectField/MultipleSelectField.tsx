import React from 'react'
import { Icon, Select } from 'antd'
import { connect } from 'react-redux'
import { SelectProps } from 'antd/lib/select'
import styles from './MultipleSelectField.less'
import checkbox from '../../assets/icons/checkbox.svg'
import checkboxEmpty from '../../assets/icons/checkboxEmpty.svg'
import { RootState } from '@store'
import cn from 'classnames'
import { interfaces } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'

interface MultipleSelectFieldProps {
    value: interfaces.MultivalueSingleValue[]
    values: Array<{ value: string }>
    meta: interfaces.WidgetField
    widgetName: string
    onChange?: (value: interfaces.MultivalueSingleValue[]) => void
    readOnly: boolean
}

const MultipleSelectField: React.FunctionComponent<MultipleSelectFieldProps> = props => {
    const { value, values, onChange, readOnly } = props
    const { Option } = Select

    const currentValues = React.useMemo(() => {
        return values?.map(item => {
            const valueIndex = value?.findIndex(v => v.value === item.value)
            return (
                <Option key={item.value} label={<div data-test-field-multipleselect-current-item={true}>{item.value}</div>}>
                    {valueIndex >= 0 ? <img alt="checkbox" src={checkbox} /> : <img alt="checkboxEmpty" src={checkboxEmpty} />}
                    <span className={styles.span} data-test-field-multipleselect-item={true}>
                        {item.value}
                    </span>
                </Option>
            )
        })
    }, [values, value, Option])

    const handleOnChange = React.useCallback(
        (v: string[]) => {
            const result: interfaces.MultivalueSingleValue[] = []
            v.map(item => result.push({ id: item, value: item }))
            onChange?.(result)
        },
        [onChange]
    )

    const extendedProps: SelectProps<string[]> = {
        ...props,
        dropdownClassName: styles.dropDownMenu,
        getPopupContainer: trigger => trigger.parentElement as HTMLElement,
        mode: 'multiple',
        optionLabelProp: 'label',
        value: value?.map(i => i.value),
        onChange: handleOnChange
    }

    const isOneLineStyle = false

    if (readOnly) {
        return <div className={styles.readOnly}>{extendedProps.value?.join(', ')}</div>
    }

    return (
        <Select
            showArrow
            {...extendedProps}
            className={cn(styles.root, extendedProps.className, isOneLineStyle && styles.oneLine)}
            suffixIcon={<Icon type="down" data-test-field-multipleselect-popup={true} />}
            removeIcon={<Icon type="close" data-test-field-multipleselect-item-clear={true} />}
        >
            {currentValues}
        </Select>
    )
}

export function mapStateToProps(state: RootState, ownProps: MultipleSelectFieldProps) {
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName
    const bcRowMeta = bcName && state.view.rowMeta[bcName]
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const rowMetaFields = bcUrl && (bcRowMeta as any)?.[bcUrl]?.fields
    const field = rowMetaFields?.find((item: any) => item.key === ownProps.meta.key)
    const values = field?.values
    return {
        values
    }
}

export default connect(mapStateToProps)(MultipleSelectField)
