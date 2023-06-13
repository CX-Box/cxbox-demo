import React, { memo } from 'react'
import {
    CustomWidgetDescriptor,
    WidgetMetaAny,
    WidgetMeta,
    skipCardWrap,
    getCardWrap,
    useShowCondition,
    getWidgetComponent
} from '@cxbox-ui/core'
import styles from './Widget.less'

interface WidgetProps {
    meta: WidgetMeta | WidgetMetaAny
    card?: (props: any) => React.ReactElement<any>
    customWidgets: Record<string, CustomWidgetDescriptor>
}

/**
 *
 * @param props
 * @category Components
 */
const Widget = ({ customWidgets, meta, card }: WidgetProps) => {
    const { hideWidget } = useShowCondition(meta)

    if (hideWidget) {
        return null
    }

    const customWidget = customWidgets[meta.type]
    const widget = getWidgetComponent(meta, customWidgets)

    if (skipCardWrap(meta, customWidget)) {
        return widget
    }

    const Card = getCardWrap(meta, card)

    return Card ? (
        <Card meta={meta}>{widget}</Card>
    ) : (
        <div className={styles.container} data-widget-type={meta.type}>
            <h2 className={styles.title}>{meta.title}</h2>
            {widget}
        </div>
    )
}

export default memo(Widget)
