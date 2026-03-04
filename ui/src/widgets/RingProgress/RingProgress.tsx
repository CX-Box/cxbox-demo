import React from 'react'
import { RingProgress as AntRingProgress } from '@ant-design/plots'
import styles from './RingProgress.less'
import { RingProgressWidgetMeta } from '@interfaces/widget'
import { Statistic, StyleAttr } from '@antv/g2plot/lib/types'
import { useAppSelector } from '@store'
import { BaseWidgetProps } from '@features/Widget'
import DashboardCard from '@components/DashboardCard/DashboardCard'

function assertIsRingProgressMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is RingProgressWidgetMeta {
    if (meta.type !== 'RingProgress') {
        throw new Error('Not a RingProgress meta')
    }
}

const RingProgress: React.FC<BaseWidgetProps> = ({ widgetMeta }) => {
    assertIsRingProgressMeta(widgetMeta)
    const { bcName } = widgetMeta
    const text = widgetMeta.options.ringProgressOptions.text
    const { numberFieldValue, descriptionFieldValue, percentFieldValue } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[bcName]?.cursor
        const data = state.data[bcName]?.find(i => i.id === cursor)
        return {
            numberFieldValue: data?.[widgetMeta.options.ringProgressOptions.numberField],
            descriptionFieldValue: data?.[widgetMeta.options.ringProgressOptions.descriptionField],
            percentFieldValue: data?.[widgetMeta.options.ringProgressOptions.percentField]
                ? parseFloat(data?.[widgetMeta.options.ringProgressOptions.percentField] as string)
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
        <DashboardCard meta={widgetMeta}>
            <div>
                <div className={styles.container}>
                    <div className={styles.textContainer}>
                        {text && <p className={styles.textDescription}>{text}</p>}
                        {numberFieldValue && <p className={styles.textValue}>{numberFieldValue}</p>}
                        {descriptionFieldValue && <p className={styles.textClarification}>{descriptionFieldValue}</p>}
                    </div>
                    <AntRingProgress
                        percent={percentFieldValue}
                        color={progressColor}
                        height={180}
                        width={180}
                        progressStyle={progressStyle}
                        innerRadius={0.7}
                        statistic={progressStatistic}
                    />
                </div>
            </div>
        </DashboardCard>
    )
}

export default React.memo(RingProgress)
