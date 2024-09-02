import React, { useEffect } from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData, useScreenBcMeta, useScreenBcPath } from '../hooks/queries'
import { useWidgetMeta } from '../hooks/queries'
import { useBcLocation } from '@hooks/useBcLocation'
import { initializeForm } from '@hooks/useBcForm'
import { useBcCursor } from '@hooks/queries/useBcCursor'

export const Form: React.FC<WidgetAnyProps> = ({ widgetName, bcName }) => {
    const { data: widgetMeta } = useWidgetMeta(widgetName)
    const { cursor } = useScreenBcPath(bcName)
    const { data } = useData(bcName, cursor)

    return (
        <div>
            {widgetMeta?.fields.map(field => (
                <span>{field.name}</span>
            ))}
        </div>
    )
}
