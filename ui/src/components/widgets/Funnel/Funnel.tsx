import React from 'react'
import { Funnel as AntFunnel } from '@ant-design/plots'
import { FunnelWidgetMeta } from '../../../interfaces/widget'
import { useSelector } from 'react-redux'
import { AppState } from '../../../interfaces/storeSlices'
import { Types } from '@antv/g2'
import { Label } from '@antv/g2plot/lib/types/label'
import { DataItem } from '@cxbox-ui/core/interfaces/data'

interface FunnelProps {
    meta: FunnelWidgetMeta
}

function Funnel({ meta }: FunnelProps) {
    const { bcName } = meta
    const { data } = useSelector((state: AppState) => {
        return { data: state.data[bcName] }
    })
    const sortedData = data?.slice().sort(sorter)
    const funnelData = sortedData?.map(i => ({ id: i.funnelKey, value: i.amount }))
    const color = sortedData?.map(i => i.color) as Array<string>

    const legend: Types.LegendCfg = {
        position: 'right',
        layout: 'vertical',
        itemMarginBottom: 16,
        itemName: { style: { fontSize: 14, fontFamily: 'Roboto', fontWeight: 400 } },
        marker: (name, index) => ({
            symbol: 'circle',
            style: {
                fill: color[index]
            }
        })
    }
    const label: Label = {
        content: labelData => labelData.value,
        style: {
            fontSize: 20,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fill: '#141F35'
        }
    }
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
