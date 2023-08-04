import React from 'react'
import Operations from '../../../Operations/Operations'
import { WidgetFormMeta } from '@cxbox-ui/core/interfaces/widget'
import { Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import styles from './ExpandedRow.module.css'
import Form from '../../Form/Form'

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
            <Form meta={widgetMeta} />
            {operations?.length ? <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} /> : null}
        </div>
    )
}

export default React.memo(ExpandedRow)
