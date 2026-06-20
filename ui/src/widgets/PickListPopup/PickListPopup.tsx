import React from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Spin } from 'antd'
import Popup from '@components/Popup/Popup'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import Table from '@components/Table/Table'
import AssocListPopup from '@widgets/AssocListPopup/AssocListPopup'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { actions } from '@actions'
import { FIELDS } from '@constants'
import { TableEventListeners } from 'antd/lib/table/interface'
import { DataItem } from '@cxbox-ui/schema'
import { PendingDataItem } from '@cxbox-ui/core'
import styles from './PickListPopup.module.css'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import { AppWidgetTableMeta } from '@interfaces/widget'

function assertIsPickListPopupMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetTableMeta {
    if (meta.type !== 'PickListPopup') {
        throw new Error('Not a PickListPopup meta')
    }
}

const PickListPopup: WidgetComponentType = ({ widgetMeta }) => {
    assertIsPickListPopupMeta(widgetMeta)
    const { bcName = '' } = widgetMeta || {}
    const selectedRowId = useAppSelector(state => state.view.selectedRow?.rowId)
    const pending = useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active'))
    const { cursor, parentBCName, pickMap } = useAppSelector(state => {
        const bcName = widgetMeta.bcName
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
        return (
            <div
                data-test="WIDGET"
                data-test-widget-type={widgetMeta.type}
                data-test-widget-position={widgetMeta.position}
                data-test-widget-title={widgetMeta.title}
                data-test-widget-name={widgetMeta.name}
            >
                <AssocListPopup widgetMeta={widgetMeta} />
            </div>
        )
    }

    return (
        <div
            data-test="WIDGET"
            data-test-widget-type={widgetMeta.type}
            data-test-widget-position={widgetMeta.position}
            data-test-widget-title={widgetMeta.title}
            data-test-widget-name={widgetMeta.name}
        >
            <Popup
                title={<WidgetTitle className={styles.title} level={1} widgetName={widgetMeta.name} text={widgetMeta.title} />}
                showed
                onOkHandler={onClose}
                onCancelHandler={onClose}
                bcName={widgetMeta.bcName}
                widgetName={widgetMeta.name}
                disablePagination={true}
                footer={null}
                className={styles.popup}
            >
                <div className={styles.container}>
                    <Spin spinning={(pending?.length as number) > 0}>
                        <Table meta={widgetMeta} disableCellEdit={false} disableMassMode={true} onRow={onRow} />
                    </Spin>
                </div>
            </Popup>
        </div>
    )
}

export default React.memo(PickListPopup)

function useShowAssocFilter() {
    return useAppSelector(state => !!state.view.popupData?.isFilter)
}
