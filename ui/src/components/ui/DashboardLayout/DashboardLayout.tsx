import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { interfaces } from '@cxbox-ui/core'
import Widget from '@components/Widget/Widget'
import styles from './DashboardLayout.less'

export interface DashboardLayoutProps {
    widgets: AppWidgetMeta[]
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
}

const sidebarWidgetsTypes: string[] = [CustomWidgetTypes.AdditionalInfo, CustomWidgetTypes.AdditionalList]

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

function groupByRow<WidgetMeta extends AppWidgetMeta>(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const byRow: Record<string, WidgetMeta[]> = {}
    const skipWidgetList = createSkipWidgetList(widgets)

    widgets
        .filter(item => {
            return !skipWidgetTypes.includes(item.type) && !skipWidgetList.includes(item.name) && !sidebarWidgetsTypes.includes(item.type)
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}

const { WidgetTypes } = interfaces

const popupWidgets = [WidgetTypes.AssocListPopup, WidgetTypes.PickListPopup, WidgetTypes.FlatTreePopup]
function getColWidth(widget: AppWidgetMeta) {
    // this is necessary so that the popup widget does not affect the formation of the grid
    const needFullWidth = popupWidgets.includes(widget.type as interfaces.WidgetTypes)

    return needFullWidth ? 24 : widget.gridWidth
}

export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
