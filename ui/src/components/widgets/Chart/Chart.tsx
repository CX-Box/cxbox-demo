import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import Table from '@components/widgets/Table/Table'
import ChartToggleButton from './components/ChartToggleButton/ChartToggleButton'
import Chart2D from './components/Chart2D/Chart2D'
import DualAxes2D from './components/DualAxes2D/DualAxes2D'
import Pie1D from './components/Pie1D/Pie1D'
import RelationGraph from './components/RelationGraph/RelationGraph'
import { useCheckLimit } from '@hooks/useCheckLimit'
import { useAppSelector } from '@store'
import { getChartIconByWidgetType } from './utils'
import {
    AppWidgetTableMeta,
    Chart2DWidgetMeta,
    CustomWidgetTypes,
    DualAxes2DWidgetMeta,
    Pie1DWidgetMeta,
    RelationGraphWidgetMeta
} from '@interfaces/widget'

interface ChartProps {
    meta: Chart2DWidgetMeta | Pie1DWidgetMeta | DualAxes2DWidgetMeta | RelationGraphWidgetMeta
}

const Chart: React.FC<ChartProps> = ({ meta }) => {
    const { t } = useTranslation()

    const [isTableView, setIsTableView] = useState(false)
    const [isIncorrectData, setIsIncorrectData] = useState(false)

    const data = useAppSelector(state => state.data[meta.bcName])

    const { bcPageLimit, isIncorrectLimit, bcCountForShowing } = useCheckLimit(meta.bcName)

    const toggleTableView = useCallback(() => {
        setIsTableView(prevState => !prevState)
    }, [])

    const tooltipErrorTitle = useMemo(() => {
        if (isIncorrectLimit) {
            return t(`Warning! Only List mode available for Chart`, {
                limit: bcPageLimit,
                bcCount: bcCountForShowing
            })
        }

        if (isIncorrectData) {
            return t('There is incorrect data, only table mode is available')
        }

        return undefined
    }, [bcCountForShowing, bcPageLimit, isIncorrectData, isIncorrectLimit, t])

    useEffect(() => {
        if (isIncorrectLimit || isIncorrectData) {
            setIsTableView(true)

            if (meta.type === CustomWidgetTypes.RelationGraph) {
                console.info(`${meta.name}: there is incorrect data, only table mode is available`)
            }
        }
    }, [isIncorrectData, isIncorrectLimit, meta.name, meta.type])

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
            case CustomWidgetTypes.RelationGraph:
                return <RelationGraph meta={meta} setDataValidationError={() => setIsIncorrectData(true)} />
            default:
                return null
        }
    }

    return (
        <div>
            <ChartToggleButton
                chartIcon={getChartIconByWidgetType(meta.type)}
                tooltipTitle={tooltipErrorTitle}
                disabled={isIncorrectLimit || isIncorrectData}
                isTableView={isTableView}
                onClick={toggleTableView}
            />

            {isTableView ? <Table meta={meta as unknown as AppWidgetTableMeta} /> : getChartByWidgetType()}
        </div>
    )
}

export default Chart
