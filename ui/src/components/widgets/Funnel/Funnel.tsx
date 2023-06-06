import React, { useMemo } from 'react'
import { Funnel as AntFunnel } from '@ant-design/plots'
import { useSelector } from 'react-redux'
import { AppState } from '@interfaces/storeSlices'
import { Types } from '@antv/g2'
import { Label } from '@antv/g2plot/lib/types/label'
import { DataItem } from '@cxbox-ui/core/interfaces/data'

interface FunnelProps {
    meta: FunnelWidgetMeta
}

const label: Label = {
    content: labelData => labelData.value,
    style: {
        fontSize: 20,
        fontFamily: 'openSans_bold',
        fill: '#141F35'
    }
}

function Funnel({ meta }: FunnelProps) {
    const data = useSelector((state: AppState) => state.data[meta.bcName])
    const sortedData = useMemo(() => data?.slice().sort(sorter), [data])
    const funnelData = useMemo(() => sortedData?.map(i => ({ id: i.funnelKey, value: i.amount })), [sortedData])
    const color = useMemo(() => sortedData?.map(i => i.color) as Array<string>, [sortedData])

    const legend: Types.LegendCfg = useMemo(
        () => ({
            position: 'right',
            layout: 'vertical',
            itemMarginBottom: 16,
            itemName: { style: { fontSize: 14, fontFamily: 'openSans_regular' } },
            marker: (name, index) => ({
                symbol: 'circle',
                style: {
                    fill: color[index]
                }
            })
        }),
        [color]
    )

    return (
        <div>
            <AntFunnel data={funnelData} xField="id" yField="value" color={color} conversionTag={false} legend={legend} label={label} />
        </div>
    )
}

function sorter(a: DataItem, b: DataItem) {
    return parseInt(b.amount as string) - parseInt(a.amount as string)
}

export default React.memo(Funnel)
