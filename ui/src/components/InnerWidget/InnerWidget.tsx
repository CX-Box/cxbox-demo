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
import { isDefined } from '@utils/isDefined'

interface InnerWidgetProps {
    widgetName: string | undefined
    title?: React.ReactNode | null
    beforeWidget?: React.ReactNode
    afterWidget?: React.ReactNode
    spinning?: boolean
}

const InnerWidget: FunctionComponent<InnerWidgetProps> = ({
    widgetName,
    title,
    beforeWidget,
    afterWidget,
    spinning: externalSpinning,
    ...props
}) => {
    const widgetVisibility = useWidgetVisibility(widgetName)
    const widget = useAppSelector(selectWidget(widgetName)) as AppWidgetMeta
    const bc = useAppSelector(selectBc(widget?.bcName))
    const spinning = useAppSelector(state => {
        if (isDefined(externalSpinning)) {
            return externalSpinning
        }

        const currentBc = selectBc(state, widget?.bcName)
        const rowMetaExists = !!selectBcUrlRowMeta(state, widget?.bcName)
        const dataExists = !!selectBcData(state, widget?.bcName)

        return !!(currentBc?.loading && (rowMetaExists || dataExists))
    })

    if (!widget) {
        return null
    }

    if (!widgetVisibility) {
        return <DebugWidgetWrapper meta={widget} />
    }

    const widgetTitle =
        title === undefined ? (
            <WidgetTitle level={2} widgetName={widget.name} text={widget?.title} bcColor={widget?.options?.title?.bgColor} />
        ) : (
            title
        )

    const widgetHasBc = widget.bcName !== null && widget.bcName !== ''
    const widgetElement = bc || !widgetHasBc ? chooseWidgetType(widget, customWidgets, props.children) : null

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
                {beforeWidget}
                <Spin spinning={spinning}>{widgetElement}</Spin>
                {afterWidget}
            </div>
        </DebugWidgetWrapper>
    )
}

export default React.memo(InnerWidget)
