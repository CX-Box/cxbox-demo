import React from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Spin } from 'antd'
import { DataItem } from '@cxbox-ui/schema'
import { PendingDataItem } from '@cxbox-ui/core'
import { TableEventListeners } from 'antd/lib/table/interface'
import Popup from '@components/Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import TreeTable from '@components/widgets/Table/TreeTable'
import AssocTreePopup from '@components/widgets/AssocTreePopup/AssocTreePopup'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { AppWidgetTableMeta } from '@interfaces/widget'
import styles from '../PickListPopup/PickListPopup.module.css'
import { getTreeFieldKeys, getTreeNodeIsLeaf } from '@utils/tree'

interface PickTreePopupProps {
    meta: AppWidgetTableMeta
}

function PickTreePopup({ meta }: PickTreePopupProps) {
    const { bcName = '' } = meta || {}
    const selectionMode = meta.options?.tree?.selection ?? 'nodeAndLeaf'
    const { isLeafFieldKey } = getTreeFieldKeys(meta)
    const selectedRowId = useAppSelector(state => state.view.selectedRow?.rowId)
    const pending = useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active'))
    const { cursor, parentBCName, pickMap } = useAppSelector(state => {
        const bc = meta.bcName ? state.screen.bo.bc[meta.bcName] : undefined
        const parentBCName = bc?.parentName

        return {
            pickMap: state.view.pickMap ?? {},
            cursor: state.screen.bo.bc[parentBCName as string]?.cursor as string,
            parentBCName: parentBCName as string
        }
    }, shallowEqual)
    const showAssocFilter = useAppSelector(state => !!state.view.popupData?.isFilter)
    const dispatch = useDispatch()

    const onClose = React.useCallback(() => {
        dispatch(actions.closeViewPopup(null))
        dispatch(actions.viewClearPickMap(null))
        dispatch(actions.bcRemoveAllFilters({ bcName }))
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
    }, [bcName, dispatch])

    const onRow = React.useCallback(
        (rowData: DataItem): TableEventListeners => ({
            onClick: () => {
                if ((rowData as Record<string, any>)._recordType !== 'node' || rowData[FIELDS.TECHNICAL.ID] === selectedRowId) {
                    return
                }

                const isLeaf = getTreeNodeIsLeaf(rowData, isLeafFieldKey)
                const selectionAllowed =
                    selectionMode === 'nodeAndLeaf' || (selectionMode === 'leaf' && isLeaf) || (selectionMode === 'node' && !isLeaf)

                if (!selectionAllowed) {
                    return
                }

                if (cursor) {
                    const dataItem: PendingDataItem = {}
                    Object.keys(pickMap).forEach(field => {
                        dataItem[field] = rowData[pickMap[field]]
                    })
                    dispatch(actions.changeDataItem({ bcName: parentBCName, cursor, dataItem, bcUrl: buildBcUrl(parentBCName, true) }))
                    dispatch(actions.deselectTableRow())
                    onClose()
                }
            }
        }),
        [cursor, dispatch, isLeafFieldKey, onClose, parentBCName, pickMap, selectedRowId, selectionMode]
    )

    if (showAssocFilter) {
        return <AssocTreePopup meta={meta} />
    }

    return (
        <Popup
            title={<WidgetTitle className={styles.title} level={1} widgetName={meta.name} text={meta.title} />}
            showed
            onOkHandler={onClose}
            onCancelHandler={onClose}
            bcName={meta.bcName}
            widgetName={meta.name}
            disablePagination={true}
            footer={null}
            className={styles.popup}
        >
            <div className={styles.container}>
                <Spin spinning={(pending?.length as number) > 0}>
                    <TreeTable meta={meta} disableRowSelection={true} onRow={onRow} />
                </Spin>
            </div>
        </Popup>
    )
}

export default React.memo(PickTreePopup)
