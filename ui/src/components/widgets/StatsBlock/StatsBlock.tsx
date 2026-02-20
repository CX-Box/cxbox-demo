import React, { useCallback, useMemo } from 'react'
import { Icon, List, Tooltip } from 'antd'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useAppDispatch, useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { getItemPropertyValue, getItemColor } from './utils'
import { actions } from '@actions'
import { DataItem } from '@cxbox-ui/core'
import { AppWidgetTableMeta, EStatsBcCursor } from '@interfaces/widget'
import styles from './StatsBlock.module.less'
import cn from 'classnames'

interface Props {
    meta: AppWidgetTableMeta
}

const StatsBlock: React.FC<Props> = ({ meta }) => {
    const dispatch = useAppDispatch()

    const data = useAppSelector(state => state.data[meta.bcName])
    const cursor = useAppSelector(state => state.screen.bo.bc[meta.bcName]?.cursor)

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const valueField = useMemo(() => {
        return meta.fields.find(field => field.key === meta.options?.stats?.valueFieldKey || field.key === 'value')
    }, [meta.fields, meta.options?.stats?.valueFieldKey])

    const handleClick = useCallback(
        (item: DataItem) => {
            if (valueField?.drillDown) {
                dispatch(
                    actions.userDrillDown({ widgetName: meta.name, bcName: meta.bcName, fieldKey: valueField?.key || '', cursor: item.id })
                )
            } else {
                dispatch(actions.bcSelectRecord({ bcName: meta.bcName, cursor: item.id }))
            }
        },
        [dispatch, meta.bcName, meta.name, valueField?.drillDown, valueField?.key]
    )

    const isBcCursorShow = !valueField?.drillDown && meta.options?.stats?.bcCursor === EStatsBcCursor.show

    return (
        <>
            {isMainWidget && <WidgetTitle level={2} widgetName={meta.name} text={meta.title} />}

            {!(isMainWidget && isCollapsed) && (
                <List
                    dataSource={data}
                    itemLayout={'horizontal'}
                    grid={{ gutter: 16, sm: 3, column: 6 }}
                    renderItem={item => (
                        <Tooltip title={getItemPropertyValue(item, meta, 'description')}>
                            <List.Item
                                className={cn(styles.itemContainer, { [styles.itemSelected]: isBcCursorShow && item.id === cursor })}
                                style={{
                                    backgroundColor: getItemColor(item, meta)
                                }}
                                onClick={() => handleClick(item)}
                            >
                                <div className={styles.itemContent}>
                                    <div style={{ fontSize: 30 }}>{getItemPropertyValue(item, meta, 'value')}</div>

                                    <div>{getItemPropertyValue(item, meta, 'title')}</div>
                                </div>

                                {(() => {
                                    const icon = getItemPropertyValue(item, meta, 'icon')

                                    return typeof icon === 'string' ? <Icon type={icon} className={styles.itemIcon} /> : null
                                })()}
                            </List.Item>
                        </Tooltip>
                    )}
                />
            )}
        </>
    )
}

export default StatsBlock
