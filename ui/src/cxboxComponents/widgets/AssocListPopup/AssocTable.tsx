import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import TableWidget from '@cxboxComponents/widgets/TableWidget/TableWidget'
import { RootState } from '@store'
import { interfaces, actions } from '@cxbox-ui/core'
import { TableProps } from 'antd/es/table'
import { useAssocRecords } from '@hooks/useAssocRecords'
import { buildBcUrl } from '@utils/buildBcUrl'
export interface AssocTableOwnProps {
    meta: interfaces.WidgetTableMeta
    disablePagination?: boolean
}

export interface AssocTableProps extends AssocTableOwnProps {
    data: interfaces.AssociatedItem[]
    assocValueKey: string
    pendingChanges: Record<string, interfaces.PendingDataItem>
    onSelect: (bcName: string, dataItem: interfaces.AssociatedItem) => void
    onSelectAll: (bcName: string, cursors: string[], dataItems: interfaces.PendingDataItem[]) => void
}

/**
 *
 * @param props
 * @category Components
 */
export const AssocTable: FunctionComponent<AssocTableProps> = props => {
    const selectedRecords = useAssocRecords(props.data, props.pendingChanges)

    const rowSelection: TableProps<interfaces.AssociatedItem>['rowSelection'] = {
        type: 'checkbox',
        selectedRowKeys: selectedRecords.map(item => item.id),
        onSelect: (record: interfaces.AssociatedItem, selected: boolean) => {
            props.onSelect(props.meta.bcName, {
                id: record.id,
                vstamp: record.vstamp,
                _value: record[props.assocValueKey],
                _associate: selected
            })
        },
        onSelectAll: (selected: boolean, selectedRows: interfaces.DataItem[], changedRows: interfaces.DataItem[]) => {
            props.onSelectAll(
                props.meta.bcName,
                changedRows.map(item => item.id),
                changedRows.map(item => ({
                    id: item.id,
                    vstamp: item.vstamp,
                    _value: item[props.assocValueKey],
                    _associate: selected
                }))
            )
        },
        getCheckboxProps: () => ({
            'data-test-widget-list-column-select': true
        })
    }

    return (
        <TableWidget
            meta={props.meta}
            rowSelection={rowSelection as TableProps<interfaces.DataItem>['rowSelection']}
            paginationMode={interfaces.PaginationMode.page}
            disablePagination={props.disablePagination}
        />
    )
}

const emptyDataItems: interfaces.AssociatedItem[] = []

function mapStateToProps(state: RootState, ownProps: AssocTableOwnProps) {
    const pendingChanges = state.view.pendingDataChanges[ownProps.meta.bcName]
    return {
        assocValueKey: state.view.popupData?.assocValueKey as string,
        data: (state.data[ownProps.meta.bcName] as interfaces.AssociatedItem[]) || emptyDataItems,
        pendingChanges
    }
}

/**
 *
 * @param dispatch
 */
export function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelect: (bcName: string, dataItem: interfaces.AssociatedItem) => {
            dispatch(actions.changeDataItem({ bcName, bcUrl: buildBcUrl(bcName, true), cursor: dataItem.id, dataItem }))
        },
        onSelectAll: (bcName: string, cursors: string[], dataItems: interfaces.PendingDataItem[]) => {
            dispatch(actions.changeDataItems({ bcName, cursors, dataItems }))
        }
    }
}

AssocTable.displayName = 'AssocTable'

/**
 * @category Components
 */
const ConnectedAssocTable = connect(mapStateToProps, mapDispatchToProps)(AssocTable)

export default ConnectedAssocTable
