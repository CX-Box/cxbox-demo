import { AppWidgetMeta } from '../../../../interfaces/widget'
import React, { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../../interfaces/storeSlices'
import { WidgetFormMeta } from '@cxbox-ui/core/interfaces/widget'
import { buildBcUrl } from '@cxbox-ui/core'
import { ExpandIconProps } from 'antd/lib/table'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import ExpandIcon from '../components/ExpandIcon'
import ExpandedRow from '../components/ExpandedRow'
import { ColumnProps } from 'antd/es/table'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { $do } from '../../../../actions/types'
import { Spin } from 'antd'
import DebugWidgetWrapper from '../../../DebugWidgetWrapper/DebugWidgetWrapper'

type ControlColumn = { column: ColumnProps<DataItem>; position: 'left' | 'right' }

type WidgetMetaField = { type: string; hidden?: boolean }

const EXPAND_ICON_COLUMN: ColumnProps<DataItem> = {
    title: '',
    width: '36px',
    key: '_expandIconField'
}

export function useInternalWidgetSelector(externalWidget: AppWidgetMeta) {
    return useSelector((state: AppState) => {
        const widgetNameForCreate = externalWidget.options?.create?.widget
        const widgetNameForEdit = externalWidget.options?.edit?.widget

        const widgetForCreate = state.view.widgets.find(widget => widgetNameForCreate === widget?.name) as WidgetFormMeta
        const widgetForEdit = state.view.widgets.find(widget => widgetNameForEdit === widget?.name) as WidgetFormMeta

        const bcName = (widgetForCreate || widgetForEdit)?.bcName as string
        const bc = state.screen.bo.bc[bcName]
        const bcUrl = bc && buildBcUrl(bcName, true)

        const rowMeta = state.view.rowMeta?.[bcName]?.[bcUrl]
        const data = state.data[bcName]

        const currentDataItem = data?.find(dataItem => dataItem.id === bc.cursor)
        const isCreateStyle = currentDataItem?.vstamp === -1

        return {
            internalWidget: isCreateStyle ? widgetForCreate : widgetForEdit,
            internalWidgetBcUrl: bcUrl,
            internalWidgetRowMeta: rowMeta,
            internalWidgetData: data,
            internalWidgetOperations: rowMeta?.actions,
            internalWidgetActiveCursor: bc?.cursor,
            isCreateStyle: isCreateStyle,
            isEditStyle: !isCreateStyle
        }
    }, shallowEqual)
}

function isExpandColumn(item: ControlColumn) {
    return item.column.key === EXPAND_ICON_COLUMN.key
}

export function useExpandableForm(currentWidgetMeta: AppWidgetMeta) {
    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, isCreateStyle, isEditStyle } =
        useInternalWidgetSelector(currentWidgetMeta)
    const { cursor: currentActiveRowId } = useSelector((state: AppState) => state.view.recordForm)
    const debugMode = useSelector((state: AppState) => state.session.debugMode || false)

    const dispatch = useDispatch()

    const expandIcon = useCallback(
        ({ expanded, record, onExpand }: ExpandIconProps<DataItem>) => {
            const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                onExpand(record, e)

                if (expanded) {
                    dispatch($do.resetRecordForm(null))
                } else {
                    dispatch(
                        $do.setRecordForm({
                            widgetName: currentWidgetMeta.name,
                            cursor: record.id,
                            bcName: currentWidgetMeta.bcName,
                            active: true,
                            create: false
                        })
                    )
                }
            }

            return <ExpandIcon expanded={expanded} openIcon="edit" closeIcon="close" onClick={handleExpand} />
        },
        [currentWidgetMeta.bcName, currentWidgetMeta.name, dispatch]
    )

    const isLoading = internalWidget && currentActiveRowId !== internalWidgetActiveCursor

    const expandedRowRender = useCallback(
        () => (
            <DebugWidgetWrapper debugMode={debugMode} meta={internalWidget}>
                <Spin spinning={isLoading}>
                    <ExpandedRow widgetMeta={internalWidget} operations={internalWidgetOperations} />
                </Spin>
            </DebugWidgetWrapper>
        ),
        [internalWidget, internalWidgetOperations, isLoading, debugMode]
    )

    const getExpandIconColumnIndex = (controlColumns: ControlColumn[]) => {
        if (!internalWidget) {
            return undefined
        }

        const expandColumn = controlColumns.find(isExpandColumn)
        const leftControlColumns = controlColumns.filter(controlColumn => controlColumn.position === 'left')
        const rightControlColumns = controlColumns.filter(controlColumn => controlColumn.position === 'right')

        if (expandColumn?.position === 'left') {
            return leftControlColumns.findIndex(item => item.column.key === EXPAND_ICON_COLUMN.key)
        }

        const widgetFields = currentWidgetMeta.fields as WidgetMetaField[]
        const visibleWidgetFields = widgetFields?.filter(item => item.type !== FieldType.hidden && !item.hidden)

        return leftControlColumns.length + visibleWidgetFields?.length + rightControlColumns.findIndex(isExpandColumn)
    }

    const expandable = !!internalWidget

    return {
        expandable,
        getExpandIconColumnIndex,
        expandIcon: expandable ? expandIcon : undefined,
        expandIconColumn: expandable ? EXPAND_ICON_COLUMN : undefined,
        expandedRowRender: expandable ? expandedRowRender : undefined,
        expandedRowKeys: expandable && currentActiveRowId ? [currentActiveRowId] : [],
        isCreateStyle,
        isEditStyle
    }
}
