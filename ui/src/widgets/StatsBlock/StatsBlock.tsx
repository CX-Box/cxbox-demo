import React, { useCallback, useMemo } from 'react'
import { Icon, List, Tooltip } from 'antd'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useAppDispatch, useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { getItemPropertyValue, getItemColor } from './utils'
import { actions } from '@actions'
import { DataItem } from '@cxbox-ui/core'
import { AppWidgetTableMeta, EStatsBcCursor } from '@interfaces/widget'
import styles from './StatsBlock.less'
import cn from 'classnames'
import { BaseWidgetProps } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsStatsBlockMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'StatsBlock') {
        throw new Error('Not a StatsBlock meta')
    }
}

const StatsBlock: React.FC<BaseWidgetProps> = ({ widgetMeta, mode }) => {
    assertIsStatsBlockMeta(widgetMeta)
    const dispatch = useAppDispatch()

    const data = useAppSelector(state => state.data[widgetMeta.bcName])
    const cursor = useAppSelector(state => state.screen.bo.bc[widgetMeta.bcName]?.cursor)

    const { isMainWidget, isCollapsed } = useWidgetCollapse(widgetMeta.name)

    const valueField = useMemo(() => {
        return widgetMeta.fields.find(field => field.key === widgetMeta.options?.stats?.valueFieldKey || field.key === 'value')
    }, [widgetMeta.fields, widgetMeta.options?.stats?.valueFieldKey])

    const handleClick = useCallback(
        (item: DataItem) => {
            if (valueField?.drillDown) {
                dispatch(
                    actions.userDrillDown({
                        widgetName: widgetMeta.name,
                        bcName: widgetMeta.bcName,
                        fieldKey: valueField?.key || '',
                        cursor: item.id
                    })
                )
            } else {
                dispatch(actions.bcSelectRecord({ bcName: widgetMeta.bcName, cursor: item.id }))
            }
        },
        [dispatch, widgetMeta.bcName, widgetMeta.name, valueField?.drillDown, valueField?.key]
    )

    const isBcCursorShow = !valueField?.drillDown && widgetMeta.options?.stats?.bcCursor === EStatsBcCursor.show

    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <EmptyCard widgetMeta={widgetMeta} mode={mode}>
                {isMainWidget && <WidgetTitle level={2} widgetName={widgetMeta.name} text={widgetMeta.title} />}

                {!(isMainWidget && isCollapsed) && (
                    <List
                        dataSource={data}
                        itemLayout={'horizontal'}
                        grid={{ gutter: 16, sm: 3, column: 6 }}
                        renderItem={item => (
                            <Tooltip title={getItemPropertyValue(item, widgetMeta, 'description')}>
                                <List.Item
                                    className={cn(styles.itemContainer, { [styles.itemSelected]: isBcCursorShow && item.id === cursor })}
                                    style={{
                                        backgroundColor: getItemColor(item, widgetMeta)
                                    }}
                                    onClick={() => handleClick(item)}
                                >
                                    <div className={styles.itemContent}>
                                        <div style={{ fontSize: 30 }}>{getItemPropertyValue(item, widgetMeta, 'value')}</div>

                                        <div>{getItemPropertyValue(item, widgetMeta, 'title')}</div>
                                    </div>

                                    {(() => {
                                        const icon = getItemPropertyValue(item, widgetMeta, 'icon')

                                        return typeof icon === 'string' ? <Icon type={icon} className={styles.itemIcon} /> : null
                                    })()}
                                </List.Item>
                            </Tooltip>
                        )}
                    />
                )}
            </EmptyCard>
        </WidgetLoader>
    )
}

export default StatsBlock
