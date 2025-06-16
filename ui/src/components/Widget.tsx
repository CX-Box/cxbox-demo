import { FC, useMemo } from 'react'
import get from 'lodash.get'
import * as widgets from '../widgets'
import { WidgetError } from './WidgetError.tsx'
import { useHooks } from '../hooks/useHooks.ts'

interface WidgetProps {
    name: string
}

export interface WidgetAnyProps {
    widgetName: string
    testingProps: Record<string, string | number | undefined>
}
/**
 *
 * @param props
 * @category Components
 */
export const Widget: FC<WidgetProps> = ({ name }) => {
    const hooks = useHooks()

    const { data: widgetMeta } = hooks.useWidgetMeta(name)
    const testingProps = useMemo(() => {
        return {
            'data-test': 'WIDGET',
            'data-test-widget-type': widgetMeta?.type,
            'data-test-widget-position': widgetMeta?.position,
            'data-test-widget-title': widgetMeta?.title,
            'data-test-widget-name': widgetMeta?.name
        }
    }, [widgetMeta])

    if (widgetMeta?.name === undefined && widgetMeta?.type === undefined) {
        return null
    }

    const WidgetComponent: FC<WidgetAnyProps> = get(widgets, widgetMeta.type, () => <WidgetError type={widgetMeta.type} />)

    return <WidgetComponent key={widgetMeta.name} widgetName={widgetMeta.name} testingProps={testingProps} />
}
