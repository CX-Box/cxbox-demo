import React from 'react'
import { RingProgress } from '@ant-design/plots'
import styles from './RingProgress.less'
import { RingProgressWidgetMeta } from '@interfaces/widget'
import { Statistic, StyleAttr } from '@antv/g2plot/lib/types'
import ChartRowsWrapper, { hasChartRowsLimit } from '@components/widgets/Chart/components/ChartRowsWrapper/ChartRowsWrapper'
import { useAppSelector } from '@store'

interface RingProgressProps {
    meta: RingProgressWidgetMeta
}

function PrjRingProgress({ meta }: RingProgressProps) {
    const { bcName } = meta
    const text = meta.options.ringProgressOptions.text
    const maxRows = meta.options.ringProgressOptions.maxRows
    const size = hasChartRowsLimit(maxRows) ? undefined : 180
    const { numberFieldValue, descriptionFieldValue, percentFieldValue } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName]?.cursor
        const data = state.data[bcName]?.find(i => i.id === cursor)
        return {
            numberFieldValue: data?.[meta.options.ringProgressOptions.numberField],
            descriptionFieldValue: data?.[meta.options.ringProgressOptions.descriptionField],
            percentFieldValue: data?.[meta.options.ringProgressOptions.percentField]
                ? parseFloat(data?.[meta.options.ringProgressOptions.percentField] as string)
                : 0
        }
    })

    const progressColor = ['#5B8FF9', '#E8EDF3']

    const progressStyle: StyleAttr = {
        lineCap: 'round',
        fillOpacity: 100
    }
    const progressStatistic: Statistic = {
        title: false,
        content: { style: { fontFamily: 'Roboto', fontWeight: 700, fontSize: '20px', color: '#141F35' } }
    }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    {text && <p className={styles.textDescription}>{text}</p>}
                    {numberFieldValue && <p className={styles.textValue}>{numberFieldValue}</p>}
                    {descriptionFieldValue && <p className={styles.textClarification}>{descriptionFieldValue}</p>}
                </div>
                <ChartRowsWrapper widgetName={meta.name} maxRows={maxRows} square>
                    <RingProgress
                        percent={percentFieldValue}
                        color={progressColor}
                        height={size}
                        width={size}
                        progressStyle={progressStyle}
                        innerRadius={0.7}
                        statistic={progressStatistic}
                    />
                </ChartRowsWrapper>
            </div>
        </div>
    )
}

export default React.memo(PrjRingProgress)
