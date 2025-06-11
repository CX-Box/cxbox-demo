import React, { FunctionComponent } from 'react'
import { Spin } from 'antd'
import { useAppSelector } from '@store'
import styles from './InnerWidget.less'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { useWidgetVisibility } from '@hooks/useWidgetVisibility'
import { customWidgets } from '@components/View/View'
import { chooseWidgetType } from '@components/Widget/Widget'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { AppWidgetMeta } from '@interfaces/widget'

interface InnerWidgetProps {
    widgetName: string | undefined
}

const InnerWidget: FunctionComponent<InnerWidgetProps> = ({ widgetName, ...props }) => {
    const widgetVisibility = useWidgetVisibility(widgetName)
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta
    const bc = useAppSelector(state => selectBc(state, widget?.bcName))
    const rowMetaExists = useAppSelector(state => !!selectBcUrlRowMeta(state, widget?.bcName))
    const dataExists = useAppSelector(state => !!selectBcData(state, widget?.bcName))
    const spinning = !!(bc?.loading && (rowMetaExists || dataExists))

    if (!widget) {
        return null
    }

    if (!widgetVisibility) {
        return <DebugWidgetWrapper meta={widget} />
    }

    const widgetHasBc = widget.bcName !== null && widget.bcName !== ''
    const widgetElement = bc || !widgetHasBc ? chooseWidgetType(widget, customWidgets, props.children) : null
    const widgetTitle = widget ? (
        <WidgetTitle level={2} widgetName={widget.name} text={widget?.title} bcColor={widget?.options?.title?.bgColor} />
    ) : null

    return (
        <DebugWidgetWrapper meta={widget}>
            <div
                className={styles.container}
                data-test="WIDGET"
                data-test-widget-type={widget.type}
                data-test-widget-position={widget.position}
                data-test-widget-title={widget.title}
                data-test-widget-name={widget.name}
            >
                {widgetTitle}
                <Spin spinning={spinning}>{widgetElement}</Spin>
            </div>
        </DebugWidgetWrapper>
    )
}

export default React.memo(InnerWidget)
