import React from 'react'
import Operations from '@components/Operations/Operations'
import Form from '@components/widgets/Form/Form'
import { Operation, OperationGroup, WidgetFormMeta } from '@cxbox-ui/core'

interface InternalFormProps {
    widgetMeta?: WidgetFormMeta
    operations?: Array<Operation | OperationGroup>
}

const InternalForm: React.FC<InternalFormProps> = ({ widgetMeta, operations }) => {
    if (!widgetMeta) {
        return null
    }

    return (
        <div>
            <Form meta={widgetMeta} />
            {operations?.length ? <Operations operations={operations} bcName={widgetMeta?.bcName} widgetMeta={widgetMeta} /> : null}
        </div>
    )
}

export default React.memo(InternalForm)
