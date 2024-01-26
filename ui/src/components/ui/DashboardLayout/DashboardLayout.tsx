import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { interfaces } from '@cxbox-ui/core'
import Widget from '@cxboxComponents/Widget/Widget'

export interface DashboardLayoutProps {
    widgets: AppWidgetMeta[]
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
    disableDebugMode?: boolean
}

export function DashboardLayout(props: DashboardLayoutProps) {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [])
    }, [props.widgets, props.skipWidgetTypes])

    const additionalInfoWidgets = useMemo(() => {
        return props.widgets.filter(widget => widget.type === CustomWidgetTypes.AdditionalInfo)
    }, [props.widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex}>
            {row.map((widget, colIndex) => (
                <Col key={colIndex} span={getColWidth(widget)}>
                    <Widget
                        meta={widget}
                        card={props.card}
                        customWidgets={props.customWidgets}
                        customSpinner={props.customSpinner}
                        disableDebugMode={props.disableDebugMode}
                    />
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
                                <Widget
                                    meta={widget}
                                    customWidgets={props.customWidgets}
                                    customSpinner={props.customSpinner}
                                    disableDebugMode={props.disableDebugMode}
                                />
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
            return !skipWidgetTypes.includes(item.type) && !skipWidgetList.includes(item.name)
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

const popupWidgets = [
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    WidgetTypes.FlatTreePopup,
    CustomWidgetTypes.FormPopup,
    CustomWidgetTypes.DocumentFormPopup
]
function getColWidth(widget: AppWidgetMeta) {
    // this is necessary so that the popup widget does not affect the formation of the grid
    const needFullWidth = popupWidgets.includes(widget.type as interfaces.WidgetTypes)

    return needFullWidth ? 24 : widget.gridWidth
}

export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
