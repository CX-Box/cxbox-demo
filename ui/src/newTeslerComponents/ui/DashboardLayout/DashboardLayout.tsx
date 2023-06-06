import React from 'react'
import { Row, Col } from 'antd'
import { CustomWidgetDescriptor, useWidgetsGrid, WidgetMeta } from '@tesler-ui/core'
import { WidgetErrorBoundary } from '@teslerComponents'
import Widget from '@newTeslerComponents/Widget/Widget'

export interface DashboardLayoutProps {
    widgets: WidgetMeta[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
}

/**
 * TODO
 *
 * @param props
 * @category Components
 */
export function DashboardLayout({ widgets, skipWidgetTypes, customWidgets, customSpinner, card }: DashboardLayoutProps) {
    const widgetsGrid = useWidgetsGrid(widgets, skipWidgetTypes)

    return (
        <React.Fragment>
            {widgetsGrid.map((row, rowIndex) => (
                <Row key={rowIndex}>
                    {row.map((widget, colIndex) => (
                        <Col key={colIndex} span={24}>
                            <WidgetErrorBoundary meta={widget}>
                                <Widget meta={widget} card={card} customWidgets={customWidgets} />
                            </WidgetErrorBoundary>
                        </Col>
                    ))}
                </Row>
            ))}
        </React.Fragment>
    )
}

/**
 * @category Components
 */
export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
