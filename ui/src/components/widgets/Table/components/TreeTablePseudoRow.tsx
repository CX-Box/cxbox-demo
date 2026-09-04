import React from 'react'
import { Checkbox, Divider, Icon, Spin, Tooltip, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import Button from '@components/ui/Button/Button'
import { TableTreeNode, useTableTree } from '@components/widgets/Table/tree/hooks/useTableTree'
import { useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { isDefined } from '@utils/isDefined'
import styles from '../Table.less'
import { ReactComponent as RightWithEllipseSvg } from '@assets/icons/rightWithEllipse.svg'

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

                <Tooltip title={dataItem._countInfoMessage} trigger="hover">
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
                        {dataItem._countInfoMessage && <Icon type="info-circle" style={{ fontSize: 12, marginLeft: 3 }} />}
                    </Button>
                </Tooltip>
            </>
        )
    } else if (dataItem._recordType === 'restore-ancestors') {
        content = (
            <>
                <Button
                    type="Link"
                    size="small"
                    removeIndentation={true}
                    disabled={dataItem._disabled}
                    loading={dataItem._loading}
                    style={{ border: 'none', width: '100%', background: 'transparent' }}
                    onClick={event => {
                        event.stopPropagation()
                        restoreAncestorPaths(dataItem.children?.map(item => item._treeParentId).filter(isDefined) ?? [])
                    }}
                >
                    <Divider style={{ margin: 0 }}>
                        <Icon
                            component={() => <RightWithEllipseSvg />}
                            style={{
                                fontSize: 14,
                                lineHeight: 1,
                                color: '#0088bb',
                                paddingRight: 8
                            }}
                        />
                        {!!dataItem._separatorText && (
                            <span style={{ fontSize: 14, fontWeight: 'normal' }}>
                                {t(dataItem._separatorText, { limit: dataItem._nestingLevel ?? 0 })}
                            </span>
                        )}
                    </Divider>
                </Button>
            </>
        )
    } else if (dataItem._recordType === 'unallocated-nodes') {
        content = <Typography.Text strong={true}>{t('Unallocated nodes')}</Typography.Text>
    }

    if (dataItem._recordType === 'restore-ancestors' || dataItem._recordType === 'unallocated-nodes') {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }} data-pseudo-row={true}>
                <span style={{ display: 'block', width: '100%' }}>{content}</span>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }} data-pseudo-row={true}>
            <span style={{ paddingLeft: paddingLeft + 22 }} />
            <span>{content}</span>
        </div>
    )
}
