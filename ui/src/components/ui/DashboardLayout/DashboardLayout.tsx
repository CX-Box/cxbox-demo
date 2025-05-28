import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import { AppWidgetMeta } from '@interfaces/widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { CustomWidgetDescriptor } from '@cxbox-ui/core'
import Widget from '@components/Widget/Widget'
import styles from './DashboardLayout.less'
import { sidebarWidgetsTypes } from '@constants/layout'
import { getColWidth, groupByRow } from '@utils/layout'

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

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex} gutter={[24, 0]}>
            {row.map((widget, colIndex) => (
                <Col key={colIndex} span={getColWidth(widget)}>
                    <Widget meta={widget} card={props.card} customWidgets={props.customWidgets} customSpinner={props.customSpinner} />
                </Col>
            ))}
        </Row>
    ))

    if (additionalInfoWidgets.length !== 0) {
        return (
            <Row gutter={24}>
                <Col span={18}>{CommonWidgets}</Col>
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

    return <React.Fragment>{CommonWidgets}</React.Fragment>
}

export default React.memo(DashboardLayout)
