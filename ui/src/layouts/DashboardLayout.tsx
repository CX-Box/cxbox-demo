import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import { AppWidgetMeta } from '@interfaces/widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import Widget from '@cxboxComponents/Widget/Widget'
import { isOffRegularLayoutWidget, isPopupWidget } from '@constants/widgets'

export interface DashboardLayoutProps {
    widgets: AppWidgetMeta[]
}

export function DashboardLayout(props: DashboardLayoutProps) {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets)
    }, [props.widgets])

    const additionalInfoWidgets = useMemo(() => {
        return props.widgets.filter(widget => isOffRegularLayoutWidget(widget.type))
    }, [props.widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={row[0].name}>
            {row.map((widget, colIndex) => (
                <Col key={colIndex} span={getColWidth(widget)}>
                    <Widget meta={widget} />
                </Col>
            ))}
        </Row>
    ))

    if (additionalInfoWidgets.length !== 0) {
        return (
            <Row gutter={24}>
                <Col span={18}>{CommonWidgets}</Col>
                <Col span={6}>
                    {additionalInfoWidgets.map(widget => (
                        <Row key={widget.name} gutter={[8, 8]}>
                            <Col span={24}>
                                <Widget meta={widget} />
                            </Col>
                        </Row>
                    ))}
                </Col>
            </Row>
        )
    }

    return <React.Fragment>{CommonWidgets}</React.Fragment>
}

function groupByRow<WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[]) {
    const byRow: Record<string, WidgetMeta[]> = {}
    const skipWidgetList = createSkipWidgetList(widgets)

    widgets
        .filter(item => {
            return !skipWidgetList.includes(item.name) && !isOffRegularLayoutWidget(item.type)
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}

function getColWidth(widget: AppWidgetMeta) {
    // this is necessary so that the popup widget does not affect the formation of the grid
    const needFullWidth = isPopupWidget(widget.type)

    return needFullWidth ? 24 : widget.gridWidth
}

export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
