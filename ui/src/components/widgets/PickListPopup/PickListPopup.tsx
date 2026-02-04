import React from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Spin } from 'antd'
import Popup from '@components/Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import Table from '@components/widgets/Table/Table'
import AssocListPopup from '../AssocListPopup/AssocListPopup'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { TableEventListeners } from 'antd/lib/table/interface'
import { DataItem } from '@cxbox-ui/schema'
import { PendingDataItem } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import styles from './PickListPopup.module.css'

interface PickListPopupProps {
    meta: AppWidgetTableMeta
}

function PickListPopup({ meta }: PickListPopupProps) {
    const { bcName = '' } = meta || {}
    const selectedRowId = useAppSelector(state => state.view.selectedRow?.rowId)
    const pending = useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active'))
    const { cursor, parentBCName, pickMap } = useAppSelector(state => {
        const bcName = meta.bcName
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined
        const parentBCName = bc?.parentName

        return {
            pickMap: state.view.pickMap ?? {},
            cursor: state.screen.bo.bc[parentBCName as string]?.cursor as string,
            parentBCName: bc?.parentName as string
        }
    }, shallowEqual)

    const showAssocFilter = useShowAssocFilter()

    const dispatch = useDispatch()

    const onClose = React.useCallback(() => {
        dispatch?.(actions.closeViewPopup(null))
        dispatch?.(actions.viewClearPickMap(null))
        dispatch?.(actions.bcRemoveAllFilters({ bcName: bcName }))
        dispatch?.(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
    }, [bcName, dispatch])

    const onRow = React.useCallback(
        (rowData: DataItem): TableEventListeners => {
            return {
                onClick: (e: React.MouseEvent) => {
                    if (rowData[FIELDS.TECHNICAL.ID] === selectedRowId) {
                        return
                    }
                    if (cursor) {
                        const dataItem: PendingDataItem = {}
                        Object.keys(pickMap).forEach(field => {
                            dataItem[field] = rowData[pickMap[field]]
                        })
                        dispatch?.(
                            actions.changeDataItem({ bcName: parentBCName, cursor, dataItem, bcUrl: buildBcUrl(parentBCName, true) })
                        )
                        dispatch(actions.deselectTableRow())
                        onClose()
                    }
                }
            }
        },
        [selectedRowId, cursor, pickMap, dispatch, parentBCName, onClose]
    )

    if (showAssocFilter) {
        return <AssocListPopup meta={meta} />
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
                    <Table meta={meta} disableCellEdit={false} disableMassMode={true} onRow={onRow} />
                </Spin>
            </div>
        </Popup>
    )
}

export default React.memo(PickListPopup)

function useShowAssocFilter() {
    return useAppSelector(state => !!state.view.popupData?.isFilter)
}
