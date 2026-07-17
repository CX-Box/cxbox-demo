import { RESTORE_ANCESTORS_ID, TREE_INDENT_SIZE } from '@components/widgets/Table/constants'
import { TableTreeNode } from '@components/widgets/Table/tree/hooks/useTableTree'

export function buildContinuingGuidesWidthById(dataSource: TableTreeNode[], expandedRowKeys: string[]) {
    const expandedRowKeySet = new Set([RESTORE_ANCESTORS_ID, ...expandedRowKeys])
    const visibleRows: TableTreeNode[] = []

    const collectVisibleRows = (rows: TableTreeNode[]) => {
        rows.forEach(row => {
            visibleRows.push(row)

            if (row.children && expandedRowKeySet.has(String(row.id))) {
                collectVisibleRows(row.children)
            }
        })
    }

    collectVisibleRows(dataSource)

    const continuingGuidesWidthById = new Map<string, string>()

    visibleRows.forEach((row, index) => {
        if (row._recordType !== 'show-more') {
            return
        }

        const nextLevel = visibleRows[index + 1]?._level
        const continuingGuideCount = nextLevel == null ? 0 : Math.min(row._level + 1, nextLevel + 1)
        const continuingGuidesWidth = continuingGuideCount === 0 ? 0 : (continuingGuideCount - 1) * TREE_INDENT_SIZE + 1

        continuingGuidesWidthById.set(String(row.id), `${continuingGuidesWidth}px`)
    })

    return continuingGuidesWidthById
}
