import React, { useMemo } from 'react'
import { TableProps } from 'antd/es/table'
import { useDebouncedWidthResize } from '@hooks/useDebouncedWidthResize'
import { isDefined } from '@utils/isDefined'
import BaseTable, { BaseTableProps } from './BaseTable'

const DEFAULT_COLUMN_WIDTH = 100

export interface StickyTableProps<T> extends Omit<BaseTableProps<T>, 'tableContainerRef' | 'stickyWithHorizontalScroll'> {}

function StickyTable<T extends { id: unknown }>(props: StickyTableProps<T>) {
    const internalWrapperRef = React.useRef<HTMLDivElement>(null)

    const { processedColumns } = useHorizontalScroll(internalWrapperRef, props.columns)

    return <BaseTable {...props} columns={processedColumns} stickyWithHorizontalScroll={true} tableContainerRef={internalWrapperRef} />
}

export default StickyTable

const parseColumnWidth = (width: string | number, containerWidth: number): number | null => {
    if (typeof width === 'number') {
        return width
    }

    if (typeof width === 'string') {
        if (width.includes('%') || width.includes('px') || !isNaN(Number(width))) {
            const parsedWidth = parseFloat(width)

            if (!isNaN(parsedWidth)) {
                if (width.includes('%') && containerWidth > 0) {
                    return (containerWidth * parsedWidth) / 100
                }

                return parsedWidth
            }
        }
    }

    return null
}

export const useHorizontalScroll = <T,>(wrapperRef: React.RefObject<HTMLElement>, columns: TableProps<T>['columns']) => {
    const [containerWidth, setContainerWidth] = React.useState<number>(0)

    useDebouncedWidthResize(wrapperRef, setContainerWidth)

    const processedColumns = useMemo(() => {
        if (!columns?.length) {
            return []
        }

        let explicitWidthTotal = 0
        let flexibleColumnsCount = 0
        let isValidWidth = true

        // We count the total width of the given columns and the number of columns without width
        columns.forEach(column => {
            if (isDefined(column.width) && column.width !== '') {
                const parsedWidth = parseColumnWidth(column.width, containerWidth)

                if (parsedWidth !== null) {
                    explicitWidthTotal += parsedWidth
                } else {
                    isValidWidth = false
                }
            } else {
                flexibleColumnsCount++
            }
        })

        if (!isValidWidth) {
            console.warn('One or more columns have an invalid width format. Falling back to default table behavior.')
            return columns
        }

        const implicitWidthTotal = flexibleColumnsCount * DEFAULT_COLUMN_WIDTH
        const totalExpectedWidth = explicitWidthTotal + implicitWidthTotal

        let calculatedFlexibleWidth = DEFAULT_COLUMN_WIDTH

        if (containerWidth > 0 && totalExpectedWidth < containerWidth && flexibleColumnsCount > 0) {
            const remainingSpace = containerWidth - explicitWidthTotal
            calculatedFlexibleWidth = remainingSpace / flexibleColumnsCount
        }

        // Forming new columns with the calculated width
        return columns.map(column => {
            if (isDefined(column.width) && column.width !== '') {
                return column
            }

            return {
                ...column,
                width: calculatedFlexibleWidth
            }
        })
    }, [columns, containerWidth])

    return {
        processedColumns
    }
}
