import React from 'react'
import { Icon, List, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { DataItem } from '@cxbox-ui/core'
import { actions } from '@actions'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import styles from './StatsBlock.less'

interface Props {
    meta: AppWidgetTableMeta
}

const getItemPropertyValue = (item: DataItem, meta: AppWidgetTableMeta, key: 'value' | 'icon' | 'description' | 'title') => {
    const statsKey = meta.options?.stats?.[`${key}FieldKey`]
    const field = meta.fields.find(field => field.key === statsKey)
    if (typeof statsKey === 'string' && field === undefined) {
        console.error(
            `widget fields does not contain "${statsKey}" that was referenced in options.stats.{value/title/icon/description}FieldKey`
        )
        return
    }
    const result = field && item[field.key] ? item[field.key] : item[key]
    if (key === 'value' && result === undefined) {
        console.error(
            `widget with name ${meta.name} must define field with value for statistics. It must have "key" = "value" in fields block or its key must be explicitly ref in options.stats.valueFieldKey property`
        )
    }
    return result
}

const getItemColor = (item: DataItem, meta: AppWidgetTableMeta) => {
    const colorKey = meta.fields.find(field => field.bgColorKey !== undefined)?.bgColorKey
    return colorKey ? (item[colorKey] as string) : meta.fields.find(field => field.bgColor !== undefined)?.bgColor
}

export const StatsBlock: React.FC<Props> = ({ meta }) => {
    const data = useAppSelector(state => state.data[meta.bcName])
    const dispatch = useAppDispatch()

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const onDrilldown = (item: DataItem) => {
        const valueField = meta.fields.find(field => field.key === meta.options?.stats?.valueFieldKey || field.key === 'value')
        dispatch(actions.userDrillDown({ widgetName: meta.name, bcName: meta.bcName, fieldKey: valueField?.key || '', cursor: item.id }))
    }

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
                                className={styles.itemContainer}
                                style={{ backgroundColor: getItemColor(item, meta) }}
                                onClick={() => onDrilldown(item)}
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
