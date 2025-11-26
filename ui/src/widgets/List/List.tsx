import { memo } from 'react'
import { AppWidgetTableMeta } from '@interfaces/widget'
import Table from '@components/Table/Table'

interface ListProps {
    meta: AppWidgetTableMeta
}

export const List = memo<ListProps>(({ meta }) => {
    return <Table meta={meta} />
})
