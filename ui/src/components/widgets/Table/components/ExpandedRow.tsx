import React from 'react'
import Operations from '../../../Operations/Operations'
import Form from '../../Form/Form'
import styles from '../Table.less'
import { interfaces } from '@cxbox-ui/core'

interface ExpandedRowProps {
    widgetMeta?: interfaces.WidgetFormMeta
    operations?: Array<interfaces.Operation | interfaces.OperationGroup>
    record: interfaces.DataItem
}

function ExpandedRow({ widgetMeta, operations, record }: ExpandedRowProps) {
    if (!widgetMeta) {
        return null
    }

    return (
        <div className={styles.expandRow} data-test-widget-list-row-id={record.id} data-test-widget-list-row-type="InlineForm">
            <Form meta={widgetMeta} />
            {operations?.length ? <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} /> : null}
        </div>
    )
}

export default React.memo(ExpandedRow)
