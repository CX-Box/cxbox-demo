import React from 'react'
import { Steps as AntSteps } from 'antd'
import styles from './Steps.module.less'
import { MassStep } from '@components/widgets/Table/massOperations/constants'

const { Step } = AntSteps

interface StepsProps {
    currentStep: string | undefined
    values: MassStep[]
}

const Steps: React.FC<StepsProps> = ({ currentStep, values }) => {
    const stepIndex = values?.findIndex(i => i.step === currentStep)

    return (
        <AntSteps className={styles.container} current={stepIndex} direction="vertical" size="small">
            {values?.map(i => {
                return <Step key={i.step} title={i.title ?? i.step} description={i.description} />
            })}
        </AntSteps>
    )
}

export default React.memo(Steps)
