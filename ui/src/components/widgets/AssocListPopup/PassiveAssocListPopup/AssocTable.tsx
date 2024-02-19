import React, { useMemo } from 'react'
import { TableRowSelection } from 'antd/lib/table'
import Table, { ControlColumn } from '../../Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { Checkbox } from 'antd'
import { useTranslation } from 'react-i18next'
import { usePassiveAssociations } from '../hooks/usePassiveAssociations'
import { interfaces } from '@cxbox-ui/core'

export interface AssocTableProps {
    meta: AppWidgetTableMeta
    disablePagination?: boolean
}

export const AssocTable = ({ ...props }: AssocTableProps) => {
    const { values: selectedRecords, selectAllItems, selectItem, changeItem } = usePassiveAssociations()

    const rowSelection: TableRowSelection<interfaces.AssociatedItem> = {
        type: 'checkbox',
        selectedRowKeys: selectedRecords.map(item => item.id),
        onSelect: selectItem,
        onSelectAll: selectAllItems
    }

    const { t } = useTranslation()

    const primaryColumn: ControlColumn = useMemo(
        () => ({
            column: {
                // TODO need to add localization
                title: props.meta.options?.primary?.title ?? t('Primary'),
                width: '85px',
                key: '_primary',
                render: (text, record) => {
                    return (
                        <Checkbox
                            checked={
                                !!selectedRecords.find(selectedRecord => selectedRecord.id === record.id && selectedRecord.options.primary)
                            }
                            onChange={e => {
                                changeItem(record, { primary: e.target.checked ?? null })
                            }}
                        />
                    )
                }
            },
            position: 'left'
        }),
        [changeItem, props.meta.options?.primary?.title, selectedRecords, t]
    )

    return (
        <Table
            meta={props.meta}
            rowSelection={rowSelection as TableRowSelection<interfaces.DataItem>}
            paginationMode={interfaces.PaginationMode.page}
            disablePagination={props.disablePagination}
            primaryColumn={primaryColumn}
        />
    )
}

export default AssocTable
