import React, { ReactNode } from 'react'
import { useHooks } from '../hooks/useHooks.ts'

interface Props {
    children: ReactNode
    widgetName: string
    fieldKey: string
    id: string
}

export const DrillDown: React.FC<Props> = props => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useWidgetMeta(props.widgetName)
    const bcName = widgetMeta?.bcName || ''
    const handleDrilldown = hooks.useDrilldown(bcName, props.fieldKey, props.id)

    return <a onClick={handleDrilldown}>{props.children}</a>
}
