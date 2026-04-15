import React, { lazy, Suspense } from 'react'
import Operations from '../../Operations/Operations'
import styles from '../Table.less'
import { Operation, OperationGroup, WidgetFormMeta } from '@cxbox-ui/core'
import { CustomDataItem } from '@components/Table/Table.interfaces'
import { WidgetComponentType } from '@features/Widget'

interface ExpandedRowProps<T> {
    widgetMeta?: WidgetFormMeta
    operations?: Array<Operation | OperationGroup>
    record: T
}

const FormComponent = lazy<WidgetComponentType>(() =>
    import(`@widgets/Form/index`).catch(() => ({
        default: () => <div>Ошибка загрузки</div>
    }))
)

function ExpandedRow<T extends CustomDataItem>({ widgetMeta, operations, record }: ExpandedRowProps<T>) {
    if (!widgetMeta) {
        return null
    }

    return (
        <div className={styles.expandRow} data-test-widget-list-row-id={record.id} data-test-widget-list-row-type="InlineForm">
            <Suspense fallback={'Loading...'}>
                <FormComponent widgetMeta={widgetMeta} mode={'headless'} />
            </Suspense>
            {operations?.length ? <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} /> : null}
        </div>
    )
}

export default React.memo(ExpandedRow) as typeof ExpandedRow
