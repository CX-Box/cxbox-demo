import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import Widget from '@components/Widget/Widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { groupByRow } from '@utils/layout'
import { sidebarWidgetsTypes } from '@constants/layout'
import { CustomWidgetDescriptor } from '@cxbox-ui/core'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import styles from './DashboardLayout.less'

export interface DashboardLayoutProps {
    widgets: AppWidgetMeta[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
}

export function DashboardLayout(props: DashboardLayoutProps) {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [])
    }, [props.widgets, props.skipWidgetTypes])

    const additionalInfoWidgets = useMemo(() => {
        const skipWidgetList = createSkipWidgetList(props.widgets)

        return props.widgets.filter(widget => sidebarWidgetsTypes.includes(widget.type) && !skipWidgetList.includes(widget.name))
    }, [props.widgets])

    const filePreviewWidget = useMemo(() => {
        return props.widgets.find(widget => widget.type === CustomWidgetTypes.FilePreview)
    }, [props.widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex} gutter={[24, 0]}>
            {row.map((widget, colIndex) => (
                <Col key={colIndex} span={widget.gridWidth}>
                    <Widget meta={widget} card={props.card} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
                </Col>
            ))}
        </Row>
    ))

    const ProcessedCommonWidgets = filePreviewWidget ? (
        <Row gutter={24}>
            <Col span={12}>{CommonWidgets}</Col>
            <Col span={12}>
                <Widget meta={filePreviewWidget} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
            </Col>
        </Row>
    ) : (
        CommonWidgets
    )

    if (additionalInfoWidgets.length !== 0) {
        return (
            <Row gutter={24}>
                <Col span={18}>{ProcessedCommonWidgets}</Col>
                <Col span={6} className={styles.additionalInfoContainer}>
                    {additionalInfoWidgets.map(widget => (
                        <Row key={widget.name} gutter={[8, 8]}>
                            <Col span={24}>
                                <Widget meta={widget} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
                            </Col>
                        </Row>
                    ))}
                </Col>
            </Row>
        )
    }

    return <React.Fragment>{ProcessedCommonWidgets}</React.Fragment>
}

export default React.memo(DashboardLayout)
