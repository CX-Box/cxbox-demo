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
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <Card widgetMeta={widgetMeta} mode={mode}>
                <Table meta={widgetMeta} />
            </Card>
        </WidgetLoader>
    )
}

export default List
