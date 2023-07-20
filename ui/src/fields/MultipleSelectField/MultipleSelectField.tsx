import React from 'react'
import { Select } from 'antd'
import { WidgetField } from '@cxbox-ui/core/interfaces/widget'
import { buildBcUrl } from '@cxbox-ui/core'
import { connect } from 'react-redux'
import { MultivalueSingleValue } from '@cxbox-ui/core/interfaces/data'
import { SelectProps } from 'antd/lib/select'
import styles from './MultipleSelectField.less'
import checkbox from '../../assets/icons/checkbox.svg'
import checkboxEmpty from '../../assets/icons/checkboxEmpty.svg'
import { AppState } from '../../interfaces/storeSlices'
import cn from 'classnames'

interface MultipleSelectFieldProps {
    value: MultivalueSingleValue[]
    values: Array<{ value: string }>
    meta: WidgetField
    widgetName: string
    onChange?: (value: MultivalueSingleValue[]) => void
    readOnly: boolean
}

const MultipleSelectField: React.FunctionComponent<MultipleSelectFieldProps> = props => {
    const { value, values, onChange, readOnly } = props
    const { Option } = Select

    const currentValues = React.useMemo(() => {
        return values?.map(item => {
            const valueIndex = value?.findIndex(v => v.value === item.value)
            return (
                <Option key={item.value} label={item.value}>
                    {valueIndex >= 0 ? <img alt="checkbox" src={checkbox} /> : <img alt="checkboxEmpty" src={checkboxEmpty} />}
                    <span className={styles.span}>{item.value}</span>
                </Option>
            )
        })
    }, [values, value, Option])

    const handleOnChange = React.useCallback(
        (v: string[]) => {
            const result: MultivalueSingleValue[] = []
            v.map(item => result.push({ id: item, value: item }))
            onChange?.(result)
        },
        [onChange]
    )

    const extendedProps: SelectProps<string[]> = {
        ...props,
        dropdownClassName: styles.dropDownMenu,
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
        <Select showArrow {...extendedProps} className={cn(styles.root, extendedProps.className, isOneLineStyle && styles.oneLine)}>
            {currentValues}
        </Select>
    )
}

export function mapStateToProps(state: AppState, ownProps: MultipleSelectFieldProps) {
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
