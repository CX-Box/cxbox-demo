import { Col, Divider, Row } from 'antd'
import { Widget } from '../components/Widget.tsx'
import { useHooks } from '../hooks/useHooks.ts'
import React, { useMemo } from 'react'
import { isWidgetList, isWidgetPickListPopup } from '../core/contract/widgets'

export const DashboardLayout = () => {
    const hooks = useHooks()
    const { data } = hooks.useViewMeta()

    const mainWidgets = useMemo(() => {
        const excludeWidgetNames = new Set<string>()
        data?.widgets.forEach(widget => {
            if (isWidgetList(widget) || isWidgetPickListPopup(widget)) {
                if (widget.options.create?.widget) {
                    excludeWidgetNames.add(widget.options.create.widget)
                }
                if (widget.options.edit?.widget) {
                    excludeWidgetNames.add(widget.options.edit.widget)
                }
            }
        })
        return data?.widgets.filter(widget => !excludeWidgetNames.has(widget.name))
    }, [data?.widgets])

    return mainWidgets?.map((widget, i) => (
        <React.Fragment key={widget.name}>
            <Row gutter={24}>
                <Col span={24}>
                    <Widget name={widget.name} />
                </Col>
            </Row>
            {i <= mainWidgets.length ? <Divider key={i} /> : null}
        </React.Fragment>
    ))
}
