import React from 'react'
import { Steps as AntSteps } from 'antd'
import { useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { buildBcUrl } from '@utils/buildBcUrl'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { StepsWidgetMeta } from '@interfaces/widget'
import styles from './Steps.module.less'
import { shallowEqual } from 'react-redux'

interface StepsProps {
    meta: StepsWidgetMeta
}

function Steps({ meta }: StepsProps) {
    const { Step } = AntSteps
    const { bcName, options } = meta
    const { stepsOptions } = options
    const { stepsDictionaryKey, descriptionFieldKey } = stepsOptions
    const bcUrl = buildBcUrl(bcName, true)
    const { stepsValues, stepsDescriptions, stepCurrentValue } = useAppSelector(state => {
        const rowMeta = state.view.rowMeta[bcName]?.[bcUrl]
        const stepsField = rowMeta?.fields.find(field => field.key === stepsDictionaryKey)
        const stepsDescriptions = rowMeta?.fields.find(field => field.key === descriptionFieldKey)
        return {
            stepsValues: stepsField?.values,
            stepsDescriptions: stepsDescriptions?.values,
            stepCurrentValue: stepsField?.currentValue
        }
    }, shallowEqual)
    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)
    const values = stepsValues?.map((val, index) => {
        return {
            step: val.value,
            description: stepsDescriptions && stepsDescriptions.length ? stepsDescriptions[index]?.value : null
        }
    })
    const currentIndex = values?.findIndex(i => i.step === stepCurrentValue)
    return (
        <>
            {isMainWidget && <WidgetTitle level={2} widgetName={meta.name} text={meta.title} />}
            {!(isMainWidget && isCollapsed) && (
                <AntSteps className={styles.container} current={currentIndex}>
                    {values?.map(i => {
                        return <Step key={i.step} title={i.step} description={i.description} />
                    })}
                </AntSteps>
            )}
        </>
    )
}

export default React.memo(Steps)
