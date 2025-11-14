import React from 'react'
import { Operation, OperationGroup, WidgetFormMeta } from '@cxbox-ui/core'
import Form from '@components/widgets/Form/Form'
import Operations, { OperationsProps } from '@components/Operations/Operations'
import { AppWidgetMeta } from '@interfaces/widget'

interface InnerFormProps extends Pick<OperationsProps, 'additionalOperations'> {
    widgetMeta?: AppWidgetMeta
    operations?: Array<Operation | OperationGroup>
    rowId?: string | number
}

function InnerForm({ widgetMeta, operations, rowId, additionalOperations }: InnerFormProps) {
    if (!widgetMeta) {
        return null
    }

    return (
        <div data-test-widget-list-row-id={rowId}>
            <Form meta={widgetMeta as WidgetFormMeta} />
            {operations?.length ? (
                <Operations
                    operations={operations}
                    bcName={widgetMeta?.bcName}
                    widgetMeta={widgetMeta}
                    additionalOperations={additionalOperations}
                />
            ) : null}
        </div>
    )
}

export default React.memo(InnerForm) as typeof InnerForm
