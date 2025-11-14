import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Icon, Menu, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import Table from '@components/widgets/Table/Table'
import Pie1D from './components/Pie1D/Pie1D'
import Chart2D from './components/Chart2D/Chart2D'
import DualAxes2D from './components/DualAxes2D/DualAxes2D'
import { useCheckLimit } from '@hooks/useCheckLimit'
import { useAppSelector } from '@store'
import { getChartIconByWidgetType } from './utils'
import { AppWidgetTableMeta, Chart2DWidgetMeta, CustomWidgetTypes, DualAxes2DWidgetMeta, Pie1DWidgetMeta } from '@interfaces/widget'
import DropdownSetting from '@components/widgets/Table/components/DropdownSetting'
import cn from 'classnames'
import styles from './Chart.module.less'

interface ChartProps {
    meta: Chart2DWidgetMeta | Pie1DWidgetMeta | DualAxes2DWidgetMeta
}

const Chart: React.FC<ChartProps> = ({ meta }) => {
    const { t } = useTranslation()

    const [isTableView, setIsTableView] = useState(false)

    const data = useAppSelector(state => state.data[meta.bcName])

    const { bcPageLimit, isIncorrectLimit, bcCountForShowing } = useCheckLimit(meta.bcName)

    useEffect(() => {
        if (isIncorrectLimit) {
            setIsTableView(true)
        }
    }, [isIncorrectLimit])

    const selectedKeys = useMemo(() => {
        if (isTableView) {
            return ['table']
        }
        return ['chart']
    }, [isTableView])

    const menu = useMemo(
        () => (
            <DropdownSetting
                buttonClassName={cn({ [styles.menuButton]: !isTableView })}
                overlay={
                    <Menu selectedKeys={selectedKeys}>
                        <Menu.ItemGroup key={'mode'} title={t('Mode')}>
                            <Menu.Item key={'chart'} onClick={() => setIsTableView(false)} disabled={isIncorrectLimit}>
                                <Tooltip
                                    title={
                                        isIncorrectLimit
                                            ? t(`Warning! Only List mode available for Chart`, {
                                                  limit: bcPageLimit,
                                                  bcCount: bcCountForShowing
                                              })
                                            : undefined
                                    }
                                >
                                    <Icon type={getChartIconByWidgetType(meta.type)} />
                                    {t('Chart')}
                                </Tooltip>
                            </Menu.Item>
                            <Menu.Item key={'table'} onClick={() => setIsTableView(true)}>
                                <Icon type={'table'} />
                                {t('Table')}
                            </Menu.Item>
                        </Menu.ItemGroup>
                    </Menu>
                }
            />
        ),
        [bcCountForShowing, bcPageLimit, isIncorrectLimit, isTableView, meta.type, selectedKeys, t]
    )

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
            {!isTableView ? menu : null}
            {isTableView ? <Table meta={meta as unknown as AppWidgetTableMeta} settingsComponent={menu} /> : getChartByWidgetType()}
        </div>
    )
}

export default Chart
