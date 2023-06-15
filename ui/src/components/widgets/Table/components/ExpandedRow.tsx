import React from 'react'
import { FormWidget } from '@cxbox-ui/core'
import Operations from '../../../Operations/Operations'
import { WidgetFormMeta } from '@cxbox-ui/core/interfaces/widget'
import { Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import styles from './ExpandedRow.module.css'

interface ExpandedRowProps {
    widgetMeta?: WidgetFormMeta
    operations?: Array<Operation | OperationGroup>
}

function ExpandedRow({ widgetMeta, operations }: ExpandedRowProps) {
    if (!widgetMeta) {
        return null
    }

    return (
        <div className={styles.root}>
            <FormWidget meta={widgetMeta} />
            {operations?.length && <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} />}
        </div>
    )
}

export default React.memo(ExpandedRow)
