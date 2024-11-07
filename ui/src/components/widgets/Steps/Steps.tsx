import React from 'react'
import { Steps as AntSteps } from 'antd'
import { useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { buildBcUrl } from '@utils/buildBcUrl'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { StepsWidgetMeta } from '@interfaces/widget'
import styles from './Steps.less'

interface StepsProps {
    meta: StepsWidgetMeta
}

function Steps({ meta }: StepsProps) {
    const { Step } = AntSteps
    const { bcName, options } = meta
    const { stepsOptions } = options
    const { stepsDictionaryKey } = stepsOptions
    const bcUrl = buildBcUrl(bcName, true)
    const { stepsValues, stepCurrentValue } = useAppSelector(state => {
        const rowMeta = state.view.rowMeta[bcName]?.[bcUrl]
        const stepsField = rowMeta?.fields.find(i => i.key === stepsDictionaryKey)
        return {
            stepsValues: stepsField?.values,
            stepCurrentValue: stepsField?.currentValue
        }
    })
    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)
    const values = stepsValues?.map(i => i.value)
    const currentIndex = values?.findIndex(i => i === stepCurrentValue)
    return (
        <>
            {isMainWidget && <WidgetTitle level={2} widgetName={meta.name} text={meta.title} />}
            {!(isMainWidget && isCollapsed) && (
                <AntSteps className={styles.container} current={currentIndex}>
                    {values?.map(i => {
                        return <Step key={i} title={i} />
                    })}
                </AntSteps>
            )}
        </>
    )
}

export default React.memo(Steps)
