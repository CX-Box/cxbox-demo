import React from 'react'
import Operations from '../../../Operations/Operations'
import Form from '../../Form/Form'
import styles from '../Table.module.less'
import { Operation, OperationGroup, WidgetFormMeta } from '@cxbox-ui/core'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'

interface ExpandedRowProps<T> {
    widgetMeta?: WidgetFormMeta
    operations?: Array<Operation | OperationGroup>
    record: T
}

function ExpandedRow<T extends CustomDataItem>({ widgetMeta, operations, record }: ExpandedRowProps<T>) {
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

export default React.memo(ExpandedRow) as typeof ExpandedRow
