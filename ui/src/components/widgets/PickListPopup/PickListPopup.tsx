import React from 'react'
import AssocListPopup from '../AssocListPopup/AssocListPopup'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import Table from '@components/widgets/Table/Table'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { shallowEqual, useDispatch } from 'react-redux'
import Popup from '@components/Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { TableEventListeners } from 'antd/lib/table/interface'
import { DataItem } from '@cxbox-ui/schema'
import { PendingDataItem } from '@cxbox-ui/core'
import styles from './PickListPopup.module.css'
import { Spin } from 'antd'

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

    const onClose = () => {
        dispatch?.(actions.closeViewPopup(null))
        dispatch?.(actions.viewClearPickMap(null))
        dispatch?.(actions.bcRemoveAllFilters({ bcName: bcName }))
    }

    const onRow = React.useCallback(
        (rowData: DataItem): TableEventListeners => {
            return {
                onClick: (e: React.MouseEvent) => {
                    if (rowData['id'] === selectedRowId) {
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
                        dispatch(actions.closeViewPopup(null))
                        dispatch(actions.viewClearPickMap(null))
                        dispatch(actions.bcRemoveAllFilters({ bcName }))
                        dispatch(actions.deselectTableRow())
                    }
                }
            }
        },
        [selectedRowId, cursor, pickMap, dispatch, parentBCName, bcName]
    )

    if (showAssocFilter) {
        return <AssocListPopup meta={meta} />
    }

    return (
        <Popup
            title={<WidgetTitle className={styles.title} level={1} widgetName={meta.name} text={meta.title} />}
            size="large"
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
                    <Table meta={meta} disableCellEdit={false} onRow={onRow} />
                </Spin>
            </div>
        </Popup>
    )
}

export default React.memo(PickListPopup)

function useShowAssocFilter() {
    return useAppSelector(state => !!state.view.popupData?.isFilter)
}
