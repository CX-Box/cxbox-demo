import React from 'react'
import { Checkbox, Icon, Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import Button from '@components/ui/Button/Button'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { isDefined } from '@utils/isDefined'
import styles from '../Table.less'

interface TreeTablePseudoRowProps {
    dataItem: TableTreeNode
    paddingLeft: number
    showSelection: boolean
    selectNode: ReturnType<typeof useTreeRowSelection>['selectNode']
    getNodeSelectionState: ReturnType<typeof useTreeRowSelection>['getNodeSelectionState']
    createFetchNodesHandler: ReturnType<typeof useTableTree>['createFetchNodesHandler']
    restoreAncestorPaths: ReturnType<typeof useTableTree>['restoreAncestorPaths']
}

export function TreeTablePseudoRow({
    dataItem,
    paddingLeft,
    showSelection,
    selectNode,
    getNodeSelectionState,
    createFetchNodesHandler,
    restoreAncestorPaths
}: TreeTablePseudoRowProps) {
    const { t } = useTranslation()
    const selectionState = getNodeSelectionState(dataItem)

    let content: React.ReactNode = null

    if (dataItem._recordType === 'loading') {
        content = <Spin size="small" />
    } else if (dataItem._recordType === 'empty') {
        content = <Typography.Text type="secondary">{t('No Data')}</Typography.Text>
    } else if (dataItem._recordType === 'show-more') {
        content = (
            <>
                {showSelection && (
                    <Checkbox
                        style={{ marginRight: 8 }}
                        className={selectionState.implicit ? styles.implicitCheckboxMuted : ''}
                        checked={selectionState.checked}
                        indeterminate={selectionState.indeterminate}
                        disabled={selectionState.disabled}
                        onChange={event => selectNode(dataItem, event.target.checked)}
                        onClick={event => event.stopPropagation()}
                    />
                )}
                <Button
                    type="Link"
                    size="small"
                    removeIndentation={true}
                    disabled={dataItem._disabled}
                    loading={dataItem._loading}
                    onClick={createFetchNodesHandler(dataItem.parentId, true)}
                    style={{ border: 'none', color: '#40a9ff', fontSize: 'var(--field-read-font-size)' }}
                >
                    {t('More {{n}}', { n: dataItem._remainingNumberOfRecords ?? '' })}
                </Button>
            </>
        )
    } else if (dataItem._recordType === 'restore-ancestors') {
        content = (
            <>
                <Button
                    style={{ marginLeft: -22, marginRight: 8 }}
                    type="default"
                    size="small"
                    disabled={dataItem._disabled}
                    loading={dataItem._loading}
                    onClick={event => {
                        event.stopPropagation()
                        restoreAncestorPaths(dataItem.children?.map(item => item._treeParentId).filter(isDefined) ?? [])
                    }}
                >
                    <Icon type="search" style={{ color: '#fa8c16' }} />
                </Button>
                {t('Path not fully restored')}
            </>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }} data-pseudo-row={true}>
            <span style={{ paddingLeft: paddingLeft + 22 }} />
            <span data-pseudo-row={true} style={dataItem._recordType === 'restore-ancestors' ? { color: '#fa8c16' } : undefined}>
                {content}
            </span>
        </div>
    )
}
