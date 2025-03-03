import React, { useCallback, useState } from 'react'
import { Empty } from 'antd'
import Table from '@components/widgets/Table/Table'
import ChartToggleButton from './components/ChartToggleButton/ChartToggleButton'
import Pie1D from './components/Pie1D/Pie1D'
import Chart2D from './components/Chart2D/Chart2D'
import DualAxes2D from './components/DualAxes2D/DualAxes2D'
import { useAppSelector } from '@store'
import { getChartIconByWidgetType } from './utils'
import { AppWidgetTableMeta, Chart2DWidgetMeta, CustomWidgetTypes, DualAxes2DWidgetMeta, Pie1DWidgetMeta } from '@interfaces/widget'

interface ChartProps {
    meta: Chart2DWidgetMeta | Pie1DWidgetMeta | DualAxes2DWidgetMeta
}

const Chart: React.FC<ChartProps> = ({ meta }) => {
    const [isTableView, setIsTableView] = useState(false)

    const data = useAppSelector(state => state.data[meta.bcName])

    const toggleTableView = useCallback(() => {
        setIsTableView(prevState => !prevState)
    }, [])

    if (!data?.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    const getChartByWidgetType = () => {
        switch (meta.type) {
            case CustomWidgetTypes.Pie1D:
                return <Pie1D meta={meta} />
            case CustomWidgetTypes.Column2D:
            case CustomWidgetTypes.Line2D:
                return <Chart2D meta={meta} />
            case CustomWidgetTypes.DualAxes2D:
                return <DualAxes2D meta={meta} />
            default:
                return null
        }
    }

    return (
        <div>
            <ChartToggleButton chartIcon={getChartIconByWidgetType(meta.type)} isTableView={isTableView} onClick={toggleTableView} />

            {isTableView ? <Table meta={meta as unknown as AppWidgetTableMeta} /> : getChartByWidgetType()}
        </div>
    )
}

export default Chart
