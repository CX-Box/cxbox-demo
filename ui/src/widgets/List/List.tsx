import React from 'react'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Table from '@components/Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

function assertIsTableMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'List') {
        throw new Error('Not a List meta')
    }
}

const List: WidgetComponentType = ({ widgetMeta, mode }) => {
    assertIsTableMeta(widgetMeta)
    return (
        <Card widgetMeta={widgetMeta} mode={mode}>
            <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
                <Table meta={widgetMeta} />
            </WidgetLoader>
        </Card>
    )
}

export default List
