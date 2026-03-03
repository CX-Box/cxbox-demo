import React from 'react'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Table from '@components/Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import Card from '@components/Card/Card'

function assertIsTableMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'List') {
        throw new Error('Not a List meta')
    }
}

const List: WidgetComponentType = ({ widgetMeta }) => {
    assertIsTableMeta(widgetMeta)
    return (
        <Card meta={widgetMeta}>
            <Table meta={widgetMeta} />
        </Card>
    )
}

export default List
