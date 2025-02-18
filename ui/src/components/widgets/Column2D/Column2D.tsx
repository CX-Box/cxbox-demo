import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Column as AntColumn } from '@ant-design/plots'
import ChartToggleButton from '@components/ChartToggleButton/ChartToggleButton'
import Table from '@components/widgets/Table/Table'
import { useAppDispatch, useAppSelector } from '@store'
import { getItemColor, getItemDescriptionValue } from '@utils/charts'
import { actions } from '@actions'
import { numberFieldTypes } from '@constants/field'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { DataItem } from '@cxbox-ui/core'
import { FieldType } from '@cxbox-ui/schema'
import { AppWidgetTableMeta, Column2DWidgetMeta } from '@interfaces/widget'

interface Column2DProps {
    meta: Column2DWidgetMeta
}

const Column2D: React.FC<Column2DProps> = ({ meta }) => {
    const dispatch = useAppDispatch()

    const [isTableView, setIsTableView] = useState(false)

    const { name, bcName, fields, options } = meta
    const data = useAppSelector(state => state.data[bcName])

    const { xValueFieldKey, xMin, xMax, xStep, yValueFieldKey, yMin, yMax, yStep, groupFieldKey, stack, descriptionFieldKey } =
        options?.chart2D || {}

    const xValueFieldMeta = useMemo(() => {
        return fields.find(field => field.key === xValueFieldKey)
    }, [xValueFieldKey, fields])

    const isXValueFieldTypeNumber = useMemo(() => numberFieldTypes.includes(xValueFieldMeta?.type as FieldType), [xValueFieldMeta?.type])

    const isYValueFieldTypeNumber = useMemo(() => {
        const yValueFieldType = fields.find(field => field.key === yValueFieldKey)?.type as FieldType

        return numberFieldTypes.includes(yValueFieldType)
    }, [yValueFieldKey, fields])

    const toggleTableView = useCallback(() => {
        setIsTableView(prevState => !prevState)
    }, [])

    const onDrillDown = useCallback(
        (item: DataItem) => {
            if (xValueFieldMeta?.drillDown) {
                dispatch(actions.userDrillDown({ widgetName: name, bcName, fieldKey: xValueFieldMeta?.key, cursor: item.id }))
            }
        },
        [dispatch, bcName, name, xValueFieldMeta?.drillDown, xValueFieldMeta?.key]
    )

    useEffect(() => {
        if (!isXValueFieldTypeNumber && (xMin || xMax || xStep)) {
            console.info(`${name} widget: field type for xValueFieldKey is not numeric; xMin, xMax, xStep are ignored`)
        }

        if (!isYValueFieldTypeNumber && (yMin || yMax || yStep)) {
            console.info(`${name} widget: field type for yValueFieldKey is not numeric; yMin, yMax, yStep are ignored`)
        }
    }, [isXValueFieldTypeNumber, isYValueFieldTypeNumber, name, xMax, xMin, xStep, yMax, yMin, yStep])

    if (!data?.length || !options?.chart2D) {
        return null
    }

    const columnConfig: ColumnConfig = {
        data,
        columnStyle: { cursor: 'pointer' },
        isGroup: !!groupFieldKey && !stack,
        isStack: stack,
        xField: xValueFieldKey,
        yField: yValueFieldKey,
        seriesField: groupFieldKey,
        legend: {
            radio: {
                style: {
                    r: 0
                }
            }
        },
        xAxis: isXValueFieldTypeNumber
            ? {
                  max: xMax,
                  min: xMin,
                  tickInterval: xStep
              }
            : undefined,
        yAxis: isYValueFieldTypeNumber
            ? {
                  max: yMax,
                  min: yMin,
                  tickInterval: yStep
              }
            : undefined,
        ...(xValueFieldMeta?.bgColor || xValueFieldMeta?.bgColorKey
            ? {
                  color: (datum, defaultColor) => getItemColor(datum, data, xValueFieldMeta) || ''
              }
            : {}),
        tooltip: {
            ...(descriptionFieldKey
                ? {
                      showTitle: true,
                      title: (title, datum) => getItemDescriptionValue(datum, descriptionFieldKey) || title,
                      domStyles: { 'g2-tooltip-list': { display: 'none' } }
                  }
                : {})
        },
        onReady: plot => {
            plot.on('element:click', (...args: any) => {
                const item = args?.[0]?.data?.data

                if (item) {
                    onDrillDown(item)
                }
            })
        }
    }

    return (
        <div>
            <ChartToggleButton chartIcon="bar-chart" isTableView={isTableView} onClick={toggleTableView} />

            {isTableView ? <Table meta={meta as unknown as AppWidgetTableMeta} /> : <AntColumn {...columnConfig} />}
        </div>
    )
}

export default Column2D
