import React from 'react'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Table from '@components/Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import DefaultCard from '@components/DefaultCard'

function assertIsTableMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'List') {
        throw new Error('Not a List meta')
    }
}

const List: WidgetComponentType = ({ widgetMeta }) => {
    assertIsTableMeta(widgetMeta)
    return (
        <DefaultCard meta={widgetMeta}>
            <Table meta={widgetMeta} />
        </DefaultCard>
    )
}

export default List
