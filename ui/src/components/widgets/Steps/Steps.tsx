import React from 'react'
import { StepsWidgetMeta } from '../../../interfaces/widget'
import { Steps as AntSteps } from 'antd'
import { buildBcUrl } from '@cxbox-ui/core'
import { useSelector } from 'react-redux'
import { AppState } from '../../../interfaces/storeSlices'
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
    const { stepsValues, stepCurrentValue } = useSelector((state: AppState) => {
        const rowMeta = state.view.rowMeta[bcName]?.[bcUrl]
        const stepsField = rowMeta?.fields.find(i => i.key === stepsDictionaryKey)
        return {
            stepsValues: stepsField?.values,
            stepCurrentValue: stepsField?.currentValue
        }
    })
    const values = stepsValues?.map(i => i.value)
    const currentIndex = values?.findIndex(i => i === stepCurrentValue)
    return (
        <AntSteps className={styles.container} current={currentIndex}>
            {values?.map(i => {
                return <Step key={i} title={i} />
            })}
        </AntSteps>
    )
}

export default React.memo(Steps)
