import React, { useMemo } from 'react'
import { Row, Col } from 'antd'
import { Widget } from '@features'
import { createSkipWidgetList } from '@utils/createSkipWidgetList'
import { groupByRow } from '@utils/layout'
import { sidebarWidgetsTypes } from '@constants/layout'
import { CustomWidgetTypes } from '@interfaces/widget'
import styles from './DashboardLayout.less'
import { useAppSelector } from '@store'

function DashboardLayout() {
    const widgets = useAppSelector(state => state.view.widgets)

    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [])
    }, [props.widgets, props.skipWidgetTypes])

    const additionalInfoWidgets = useMemo(() => {
        const skipWidgetList = createSkipWidgetList(widgets)

        return widgets.filter(widget => sidebarWidgetsTypes.includes(widget.type) && !skipWidgetList.includes(widget.name))
    }, [widgets])

    const filePreviewWidget = useMemo(() => {
        return widgets.find(widget => widget.type === CustomWidgetTypes.FilePreview)
    }, [widgets])

    const CommonWidgets = Object.values(widgetsByRow).map((row, rowIndex) => (
        <Row key={rowIndex} gutter={[24, 0]}>
            {row.map((widget, colIndex) => (
                <Col key={colIndex} span={widget.gridWidth}>
                    <Widget meta={widget} />
                </Col>
            ))}
        </Row>
    ))

    const ProcessedCommonWidgets = filePreviewWidget ? (
        <Row gutter={24}>
            <Col span={12}>{CommonWidgets}</Col>
            <Col span={12}>
                <Widget meta={filePreviewWidget} />
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
                                <Widget meta={widget} />
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
