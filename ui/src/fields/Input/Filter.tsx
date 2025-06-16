import { FieldComponent } from '../index.ts'
import { Button, Input, Space } from 'antd'
import { useHooks } from '../../hooks/useHooks.ts'
import { useState } from 'react'

export const Filter: FieldComponent['Filter'] = props => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useWidgetMeta(props.widgetName)
    const bcName = widgetMeta?.bcName || ''
    const setBcFilter = hooks.useStore(state => state.setBcFilter)
    const resetBcFilter = hooks.useStore(state => state.resetBcFilter)
    const filterValue = hooks.useStore(
        state => state.bcTree.find(bc => bc.name === bcName)?.filters?.find(filter => filter.fieldKey === props.fieldKey)?.value || ''
    )
    const [value, setValue] = useState(filterValue)

    const handleApply = () => {
        setBcFilter(bcName, {
            value: value,
            fieldKey: props.fieldKey,
            type: 'contains'
        })
        props.onClose()
    }
    const handleReset = () => {
        resetBcFilter(bcName, props.fieldKey)
        props.onClose()
    }

    return (
        <div style={{ padding: 8 }}>
            <Input style={{ marginBottom: 8 }} value={value} onChange={e => setValue(e.target.value)} />
            <Space>
                <Button onClick={handleApply}>Apply</Button>
                <Button onClick={handleReset}>Reset</Button>
            </Space>
        </div>
    )
}

Filter.displayName = 'Input.Filter'
