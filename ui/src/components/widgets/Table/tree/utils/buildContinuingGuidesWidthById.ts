import { RESTORE_ANCESTORS_ID, TREE_INDENT_SIZE } from '@components/widgets/Table/constants'
import { TableTreeNode } from '@components/widgets/Table/tree/hooks/useTableTree'
import { isRestoreAncestorsBranch } from '@components/widgets/Table/tree/hooks/useTreeDataSource'

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

        const isRestoreBranch = isRestoreAncestorsBranch(row)
        const nextRow = visibleRows[index + 1]
        const isNextRowInSameBranch = nextRow && (isRestoreBranch ? isRestoreAncestorsBranch(nextRow) : !isRestoreAncestorsBranch(nextRow))
        const isNextRowPseudoContainer =
            nextRow && (nextRow._recordType === 'restore-ancestors' || nextRow._recordType === 'unallocated-nodes')

        let continuingGuideCount = 0

        if (nextRow && isNextRowInSameBranch && !isNextRowPseudoContainer) {
            const rowGuideCount = isRestoreBranch ? Math.max(0, row._level) : row._level + 1
            const nextRowGuideCount = isRestoreBranch ? Math.max(0, nextRow._level ?? 0) : (nextRow._level ?? 0) + 1

            continuingGuideCount = Math.min(rowGuideCount, nextRowGuideCount)
        }

        const continuingGuidesWidth = continuingGuideCount === 0 ? 0 : (continuingGuideCount - 1) * TREE_INDENT_SIZE + 1

        continuingGuidesWidthById.set(String(row.id), `${continuingGuidesWidth}px`)
    })

    return continuingGuidesWidthById
}
