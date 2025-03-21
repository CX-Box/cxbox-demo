import { useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@store'
import { getItemColor, getItemDescriptionValue } from '../utils'
import { actions } from '@actions'
import { numberFieldTypes } from '@constants/field'
import { defaultGroupFieldKey } from '@components/widgets/Chart/constants'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { LineConfig } from '@ant-design/plots/es/components/line'
import { DataItem } from '@cxbox-ui/core'
import { FieldType } from '@cxbox-ui/schema'
import { Chart2DWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'

const emptyObject = {}
const emptyArray: DataItem[] = []

export const useChart2D = (meta: Chart2DWidgetMeta, needToChangeGroupFieldData?: boolean) => {
    const dispatch = useAppDispatch()

    const { name, type, bcName, fields, options } = meta || emptyObject
    const data = useAppSelector(state => state.data[bcName]) || emptyArray

    const { xValueFieldKey, xMin, xMax, xStep, yValueFieldKey, yMin, yMax, yStep, groupFieldKey, stack, descriptionFieldKey } =
        options?.chart2D || emptyObject

    const xValueFieldMeta = useMemo(() => {
        return fields?.find(field => field.key === xValueFieldKey)
    }, [xValueFieldKey, fields])

    const isXValueFieldTypeNumber = useMemo(() => numberFieldTypes.includes(xValueFieldMeta?.type as FieldType), [xValueFieldMeta?.type])

    const yValueFieldMeta = useMemo(() => {
        return fields?.find(field => field.key === yValueFieldKey)
    }, [yValueFieldKey, fields])

    const isYValueFieldTypeNumber = useMemo(() => numberFieldTypes.includes(yValueFieldMeta?.type as FieldType), [yValueFieldMeta?.type])

    const processedData = useMemo(() => {
        const filteredData = data.filter(item => item[yValueFieldKey] !== null)
        // DualAxes2D legend fix
        if (needToChangeGroupFieldData) {
            return filteredData?.map(item => ({
                ...item,
                ...(groupFieldKey
                    ? {
                          [groupFieldKey]: ` ${item[groupFieldKey]}`
                      }
                    : {
                          [defaultGroupFieldKey]: ` ${yValueFieldMeta?.title || yValueFieldKey}`
                      })
            }))
        }

        if (!groupFieldKey) {
            return filteredData?.map(item => ({
                ...item,
                [defaultGroupFieldKey]: yValueFieldMeta?.title || yValueFieldKey
            }))
        }

        return filteredData
    }, [data, groupFieldKey, needToChangeGroupFieldData, yValueFieldKey, yValueFieldMeta?.title])

    const onDrillDown = useCallback(
        (item: DataItem) => {
            if (xValueFieldMeta?.drillDown) {
                dispatch(actions.userDrillDown({ widgetName: name, bcName, fieldKey: xValueFieldMeta?.key, cursor: item.id }))
            }
        },
        [dispatch, bcName, name, xValueFieldMeta?.drillDown, xValueFieldMeta?.key]
    )

    const chart2DConfig: ColumnConfig | LineConfig = useMemo(
        () =>
            options?.chart2D && {
                ...(type === CustomWidgetTypes.Column2D
                    ? {
                          columnStyle: {
                              cursor: 'pointer'
                          },
                          isGroup: !!groupFieldKey && !stack
                      }
                    : {
                          point: {
                              style: {
                                  cursor: 'pointer'
                              }
                          }
                      }),
                data: processedData,
                xField: xValueFieldKey,
                yField: yValueFieldKey,
                seriesField: groupFieldKey || defaultGroupFieldKey,
                isStack: stack,
                legend: {
                    radio: {
                        style: {
                            r: 0
                        }
                    }
                },
                xAxis: {
                    ...(isXValueFieldTypeNumber && {
                        max: xMax,
                        min: xMin,
                        tickInterval: xStep
                    }),
                    ...(xValueFieldMeta?.title && {
                        title: {
                            text: xValueFieldMeta.title
                        }
                    })
                },
                yAxis: {
                    ...(isYValueFieldTypeNumber && {
                        max: yMax,
                        min: yMin,
                        tickInterval: yStep
                    }),
                    ...(yValueFieldMeta?.title && {
                        title: {
                            text: yValueFieldMeta.title
                        }
                    })
                },
                tooltip: {
                    ...(descriptionFieldKey && {
                        showTitle: true,
                        title: (title, datum) => getItemDescriptionValue(datum, descriptionFieldKey) || title,
                        domStyles: { 'g2-tooltip-list': { display: 'none' } }
                    })
                },
                ...((xValueFieldMeta?.bgColor || xValueFieldMeta?.bgColorKey) && {
                    color: (datum, defaultColor) => getItemColor(datum, processedData, xValueFieldMeta) || ''
                }),
                onReady: (chart: any) => {
                    chart.on('element:click', (...args: any) => {
                        const item = args?.[0]?.data?.data

                        if (item && !Array.isArray(item)) {
                            onDrillDown(item)
                        }
                    })
                }
            },
        [
            processedData,
            descriptionFieldKey,
            groupFieldKey,
            isXValueFieldTypeNumber,
            isYValueFieldTypeNumber,
            onDrillDown,
            options?.chart2D,
            stack,
            type,
            xMax,
            xMin,
            xStep,
            xValueFieldKey,
            xValueFieldMeta,
            yMax,
            yMin,
            yStep,
            yValueFieldKey,
            yValueFieldMeta?.title
        ]
    )

    useEffect(() => {
        if (meta && !options?.chart2D) {
            console.info(`${name} widget: no 'options.chart2D'`)
        }
    }, [meta, name, options?.chart2D])

    useEffect(() => {
        if (!isXValueFieldTypeNumber && (xMin || xMax || xStep)) {
            console.info(`${name} widget: field type for 'xValueFieldKey' is not numeric; 'xMin, xMax, xStep' are ignored`)
        }

        if (!isYValueFieldTypeNumber && (yMin || yMax || yStep)) {
            console.info(`${name} widget: field type for 'yValueFieldKey' is not numeric; 'yMin, yMax, yStep' are ignored`)
        }
    }, [isXValueFieldTypeNumber, isYValueFieldTypeNumber, name, xMax, xMin, xStep, yMax, yMin, yStep])

    return chart2DConfig
}
