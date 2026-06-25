import React from 'react'
import BaseTable, { BaseTableProps } from './BaseTable'

export interface StandardTableProps<T> extends Omit<BaseTableProps<T>, 'tableContainerRef' | 'stickyWithHorizontalScroll'> {}

function StandardTable<T extends { id: unknown }>(props: StandardTableProps<T>) {
    return <BaseTable {...props} stickyWithHorizontalScroll={false} />
}

export default StandardTable
