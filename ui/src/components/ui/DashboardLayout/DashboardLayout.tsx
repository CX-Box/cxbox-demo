import React from 'react'
import { Row, Col } from 'antd'
import { Widget } from '@cxbox-ui/core'
import { CustomWidgetDescriptor } from '@cxbox-ui/core/interfaces/widget'
import { AppWidgetMeta, CustomWidgetTypes } from '../../../interfaces/widget'
import { createSkipWidgetList } from '../../../utils/createSkipWidgetList'

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
    return (
        <React.Fragment>
            {Object.values(widgetsByRow).map((row, rowIndex) => (
                <Row key={rowIndex}>
                    {row.map((widget, colIndex) => (
                        <Col key={colIndex} span={widget.gridWidth}>
                            <Widget
                                meta={widget}
                                card={props.card}
                                customWidgets={props.customWidgets}
                                customSpinner={props.customSpinner}
                            />
                        </Col>
                    ))}
                </Row>
            ))}
        </React.Fragment>
    )
}

function groupByRow<WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const byRow: Record<string, WidgetMeta[]> = {}
    const skipWidgetList = createSkipWidgetList(widgets)

    widgets
        .filter((item, index) => {
            const isAppBarTabs = index === 0 && item.type === CustomWidgetTypes.Tabs

            return !skipWidgetTypes.includes(item.type) && !skipWidgetList.includes(item.name) && !isAppBarTabs
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}

export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
