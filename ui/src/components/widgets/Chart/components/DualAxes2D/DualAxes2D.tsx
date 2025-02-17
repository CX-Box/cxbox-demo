import React, { useEffect, useMemo } from 'react'
import { DualAxes as AntDualAxes } from '@ant-design/plots'
import { useAppSelector } from '@store'
import { useChart2D } from '../../hooks/useChart2D'
import { getItemDescriptionValue } from '../../utils'
import { getGeometryOption } from './utils'
import { DualAxesConfig } from '@ant-design/plots/es/components/dual-axes'
import { Chart2DWidgetMeta, DualAxes2DWidgetMeta } from '@interfaces/widget'

interface DualAxes2DProps {
    meta: DualAxes2DWidgetMeta
}

const emptyArray: string[] = []

const DualAxes2D: React.FC<DualAxes2DProps> = ({ meta }) => {
    const viewWidgets = useAppSelector(state => state.view.widgets)

    const optionsDual2D = meta.options?.dual2D
    const [firstWidgetName, secondWidgetName] = optionsDual2D?.widgets || emptyArray
    const firstChartWidgetMeta = viewWidgets.find(item => item.name === firstWidgetName) as Chart2DWidgetMeta
    const secondChartWidgetMeta = viewWidgets.find(item => item.name === secondWidgetName) as Chart2DWidgetMeta

    const firstChartConfig = useChart2D(firstChartWidgetMeta)
    const secondChartConfig = useChart2D(secondChartWidgetMeta)

    const needToHideSecondYAxis = firstChartConfig.yField === secondChartConfig.yField

    const uniqueDescriptionFieldKeys = useMemo(() => {
        const firstChartDescriptionFieldKey = firstChartWidgetMeta?.options?.chart2D?.descriptionFieldKey
        const secondChartDescriptionFieldKey = secondChartWidgetMeta?.options?.chart2D?.descriptionFieldKey
        const descriptionFieldKeys = [...(firstChartDescriptionFieldKey || emptyArray), ...(secondChartDescriptionFieldKey || emptyArray)]

        return Array.from(new Set(descriptionFieldKeys))
    }, [firstChartWidgetMeta?.options?.chart2D?.descriptionFieldKey, secondChartWidgetMeta?.options?.chart2D?.descriptionFieldKey])

    const dualAxesConfig: DualAxesConfig = useMemo(
        () =>
            firstChartConfig &&
            secondChartConfig && {
                data: [firstChartConfig.data, secondChartConfig.data],
                xField: firstChartConfig.xField as string,
                yField: [firstChartConfig.yField as string, secondChartConfig.yField as string],
                geometryOptions: [
                    getGeometryOption(firstChartWidgetMeta?.type, firstChartConfig),
                    getGeometryOption(secondChartWidgetMeta?.type, secondChartConfig)
                ],
                ...(needToHideSecondYAxis && {
                    meta: {
                        [firstChartConfig.yField as string]: {
                            sync: true
                        }
                    }
                }),
                xAxis: firstChartConfig.xAxis,
                yAxis: [firstChartConfig.yAxis, needToHideSecondYAxis ? false : secondChartConfig.yAxis],
                tooltip: {
                    ...(!!uniqueDescriptionFieldKeys?.length && {
                        showTitle: true,
                        title: (title, datum) => getItemDescriptionValue(datum, uniqueDescriptionFieldKeys) || title,
                        domStyles: { 'g2-tooltip-list': { display: 'none' } }
                    })
                },
                onReady: firstChartConfig.onReady as any
            },
        [
            firstChartConfig,
            firstChartWidgetMeta?.type,
            needToHideSecondYAxis,
            secondChartConfig,
            secondChartWidgetMeta?.type,
            uniqueDescriptionFieldKeys
        ]
    )

    useEffect(() => {
        if (!optionsDual2D) {
            console.info(`${meta.name} widget: no options.dual2D`)
        }
    }, [meta.name, optionsDual2D])

    useEffect(() => {
        if (firstChartWidgetMeta?.bcName !== secondChartWidgetMeta?.bcName) {
            console.info(`${meta.name} widget: widgets in options.dual2D must have the same bc`)
        }
    }, [firstChartWidgetMeta?.bcName, meta.name, secondChartWidgetMeta?.bcName])

    if (!dualAxesConfig) {
        return null
    }

    return <AntDualAxes {...dualAxesConfig} />
}

export default DualAxes2D
