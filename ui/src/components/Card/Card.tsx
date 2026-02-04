import React from 'react'
import { Col, Row } from 'antd'
import cn from 'classnames'
import { WidgetTypes } from '@cxbox-ui/core'
import Operations from '../Operations/Operations'
import { useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { buildBcUrl } from '@utils/buildBcUrl'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import styles from './Card.less'

export interface CardProps {
    children: React.ReactNode
    meta: AppWidgetMeta
    className?: string
}

const showOperations = [WidgetTypes.DataGrid, WidgetTypes.Form, CustomWidgetTypes.CardCarouselList, CustomWidgetTypes.CardList]

function Card({ meta, children, className }: CardProps) {
    const { type, bcName } = meta
    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const bcUrl = useAppSelector(state => state.screen.bo.bc[bcName] && buildBcUrl(bcName, true))
    const operations = useAppSelector(state => state.view.rowMeta?.[bcName]?.[bcUrl]?.actions)
    const isForm = type === WidgetTypes.Form

    return (
        <Row justify="center">
            <Col span={24}>
                <div
                    className={cn(styles.container, className)}
                    data-test="WIDGET"
                    data-test-widget-type={meta.type}
                    data-test-widget-position={meta.position}
                    data-test-widget-title={meta.title}
                    data-test-widget-name={meta.name}
                >
                    <WidgetTitle level={2} widgetName={meta.name} text={meta.title} bcColor={meta?.options?.title?.bgColor} />
                    {!(isMainWidget && isCollapsed) && (
                        <>
                            {isForm && children}
                            {showOperations.includes(type as WidgetTypes) && (
                                <Operations
                                    operations={operations}
                                    bcName={bcName}
                                    widgetMeta={meta}
                                    className={cn({
                                        [styles.operations]: !isForm
                                    })}
                                />
                            )}
                            {!isForm && children}
                        </>
                    )}
                </div>
            </Col>
        </Row>
    )
}

export default React.memo(Card)
