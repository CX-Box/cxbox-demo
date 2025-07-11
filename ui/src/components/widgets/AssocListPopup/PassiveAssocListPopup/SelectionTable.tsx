import React, { useMemo } from 'react'
import { TableRowSelection } from 'antd/lib/table'
import Table from '../../Table/Table'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { Checkbox } from 'antd'
import { useTranslation } from 'react-i18next'
import { usePassiveAssociations } from './hooks/usePassiveAssociations'
import { AssociatedItem } from '@cxbox-ui/core'
import { ControlColumn } from '@components/widgets/Table/Table.interfaces'

export interface SelectionTableProps {
    meta: AppWidgetTableMeta
    disablePagination?: boolean
}

export const SelectionTable = ({ ...props }: SelectionTableProps) => {
    const { values: selectedRecords, selectAllItems, selectItem, changeItem } = usePassiveAssociations()

    const rowSelection: TableRowSelection<AssociatedItem> = {
        type: 'checkbox',
        selectedRowKeys: selectedRecords.map(item => item.id),
        onSelect: selectItem,
        onSelectAll: selectAllItems
    }

    const { t } = useTranslation()

    const primaryColumn: ControlColumn<AssociatedItem> = useMemo(
        () => ({
            column: {
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
            rowSelection={rowSelection}
            disableMassMode={true}
            disablePagination={props.disablePagination}
            primaryColumn={primaryColumn}
        />
    )
}

export default SelectionTable
