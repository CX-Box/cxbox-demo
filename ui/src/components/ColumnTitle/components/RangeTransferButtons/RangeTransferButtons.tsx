import React from 'react'
import { Button } from 'antd'
import { isEmptyValue } from '../utils'
import { DataValue } from '@cxbox-ui/schema'
import styles from './RangeTransferButtons.less'

interface RangeTransferButtonsProps {
    startValue: DataValue
    endValue: DataValue
    localValues?: DataValue[]
    onChange: (v: DataValue[]) => void
}

const RangeTransferButtons: React.FC<RangeTransferButtonsProps> = ({ startValue, endValue, localValues, onChange }) => {
    const [localStartValue, localEndValue] = localValues ?? [startValue, endValue]

    return (
        <div className={styles.container}>
            <Button disabled={isEmptyValue(localStartValue)} onClick={() => onChange([startValue, startValue])} icon="right" />

            <Button disabled={isEmptyValue(localEndValue)} onClick={() => onChange([endValue, endValue])} icon="left" />
        </div>
    )
}

export default RangeTransferButtons
