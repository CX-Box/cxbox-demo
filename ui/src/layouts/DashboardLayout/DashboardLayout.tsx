import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import Widget from '@features/Widget'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { groupByRow } from '@utils/layout'
import { popupWidgets, sidebarWidgetsTypes } from '@constants/layout'
import { WidgetTypes } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'
import styles from './DashboardLayout.less'
import { BaseLayoutProps } from '@features/Layout'

const DashboardLayout: React.FC<BaseLayoutProps> = props => {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, [])
    }, [props.widgets])

    const additionalInfoWidgets = useMemo(() => {
        const skipWidgetList = createSkipWidgetList(props.widgets)

        return props.widgets.filter(widget => sidebarWidgetsTypes.includes(widget.type) && !skipWidgetList.includes(widget.name))
    }, [props.widgets])

    const filePreviewWidget = useMemo(() => {
        return props.widgets.find(widget => widget.type === CustomWidgetTypes.FilePreview)
    }, [props.widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex} gutter={[24, 0]}>
            {row.map((widget, colIndex) => {
                const widgetCol = (
                    <Col key={colIndex} span={widget.gridWidth}>
                        <Widget widgetMeta={widget} />
                    </Col>
                )

                return popupWidgets.includes(widget.type as WidgetTypes) ? (
                    <Col key={colIndex} span={24}>
                        <Row gutter={[24, 0]}>{widgetCol}</Row>
                    </Col>
                ) : (
                    widgetCol
                )
            })}
        </Row>
    ))

    const ProcessedCommonWidgets = filePreviewWidget ? (
        <Row gutter={24}>
            <Col span={12}>{CommonWidgets}</Col>
            <Col span={12}>
                <Widget widgetMeta={filePreviewWidget} />
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
                                <Widget widgetMeta={widget} />
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
