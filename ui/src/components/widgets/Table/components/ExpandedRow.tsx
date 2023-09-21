import React from 'react'
import { WidgetFormMeta } from '@cxbox-ui/core/interfaces/widget'
import { Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import Operations from '../../../Operations/Operations'
import Form from '../../Form/Form'
import styles from './ExpandedRow.module.css'

interface ExpandedRowProps {
    widgetMeta?: WidgetFormMeta
    operations?: Array<Operation | OperationGroup>
    record: DataItem
}

function ExpandedRow({ widgetMeta, operations, record }: ExpandedRowProps) {
    if (!widgetMeta) {
        return null
    }

    return (
        <div className={styles.root} data-test-widget-list-row-id={record.id} data-test-widget-list-row-type="InlineForm">
            <Form meta={widgetMeta} />
            {operations?.length ? <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} /> : null}
        </div>
    )
}

export default React.memo(ExpandedRow)
