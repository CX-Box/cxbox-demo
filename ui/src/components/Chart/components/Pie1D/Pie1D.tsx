import React, { useCallback, useEffect, useMemo } from 'react'
import { Pie as AntPie } from '@ant-design/plots'
import { useAppDispatch, useAppSelector } from '@store'
import { getAggFieldValue } from './utils'
import { getItemColor, getItemDescriptionValue } from '../../utils'
import { actions } from '@actions'
import { defaultColorField } from './constants'
import { DataItem } from '@cxbox-ui/core'
import { PieConfig } from '@ant-design/plots/es/components/pie'
import { Pie1DWidgetMeta } from '@interfaces/widget'

interface Pie1DProps {
    meta: Pie1DWidgetMeta
}

const Pie1D: React.FC<Pie1DProps> = ({ meta }) => {
    const dispatch = useAppDispatch()

    const { name, bcName, fields, options } = meta
    const data = useAppSelector(state => state.data[bcName])
    const { valueFieldKey, titleFieldKey, valuePosition, descriptionFieldKey, total } = options?.chart1D || {}

    const valueFieldMeta = useMemo(() => {
        return fields.find(field => field.key === valueFieldKey)
    }, [fields, valueFieldKey])

    const processedData = useMemo(() => {
        return titleFieldKey
            ? data
            : data?.map((item, index) => ({
                  ...item,
                  _colorField: item[valueFieldKey]
              }))
    }, [data, titleFieldKey, valueFieldKey])

    const onDrillDown = useCallback(
        (item: DataItem) => {
            if (valueFieldMeta?.drillDown) {
                dispatch(actions.userDrillDown({ widgetName: name, bcName, fieldKey: valueFieldMeta?.key, cursor: item.id }))
            }
        },
        [dispatch, bcName, name, valueFieldMeta?.drillDown, valueFieldMeta?.key]
    )

    const pieConfig: PieConfig = useMemo(
        () =>
            options?.chart1D && {
                data: processedData,
                pieStyle: {
                    cursor: 'pointer'
                },
                angleField: valueFieldKey,
                colorField: titleFieldKey || defaultColorField,
                legend: titleFieldKey
                    ? {
                          radio: {
                              style: {
                                  r: 0
                              }
                          }
                      }
                    : false,
                label: {
                    type: valuePosition || 'inner',
                    autoRotate: false,
                    offset: '-50%'
                },
                innerRadius: total?.innerSpace ?? 0.5,
                interactions: [
                    {
                        type: 'element-selected'
                    },
                    {
                        type: 'element-active'
                    }
                ],
                tooltip:
                    titleFieldKey || descriptionFieldKey
                        ? {
                              ...(descriptionFieldKey && {
                                  showTitle: true,
                                  title: (title, datum) => getItemDescriptionValue(datum, descriptionFieldKey) || title,
                                  domStyles: { 'g2-tooltip-list': { display: 'none' } }
                              })
                          }
                        : false,
                statistic: {
                    title: false,
                    content: {
                        style: {
                            whiteSpace: 'pre-wrap',
                            textOverflow: 'ellipsis',
                            padding: '2px'
                        },
                        customHtml: (container, view, datum, data) => {
                            const totalValue = total?.value

                            if (totalValue) {
                                return totalValue
                            }

                            const description = total?.description || ''
                            const aggValue = getAggFieldValue(data, options?.chart1D) || ''

                            return `${description}\n${aggValue}`
                        }
                    }
                },
                ...((valueFieldMeta?.bgColor || valueFieldMeta?.bgColorKey) && {
                    color: (datum, defaultColor) => getItemColor(datum, processedData, valueFieldMeta) || ''
                }),
                onReady: chart => {
                    chart.on('element:click', (...args: any) => {
                        const item = args?.[0]?.data?.data

                        if (item) {
                            onDrillDown(item)
                        }
                    })
                }
            },
        [
            descriptionFieldKey,
            onDrillDown,
            options?.chart1D,
            processedData,
            titleFieldKey,
            total?.description,
            total?.innerSpace,
            total?.value,
            valueFieldKey,
            valueFieldMeta,
            valuePosition
        ]
    )

    useEffect(() => {
        if (!options?.chart1D) {
            console.info(`${name} widget: no 'options.chart1D'`)
        }
    }, [name, options?.chart1D])

    useEffect(() => {
        if (total?.value && total?.func) {
            console.info(`${name} widget: you have set 'chart1D.total.value' and 'chart1D.total.func', you need to set only one`)
        }
    }, [name, total?.func, total?.value])

    if (!pieConfig) {
        return null
    }

    return <AntPie {...pieConfig} />
}

export default Pie1D
