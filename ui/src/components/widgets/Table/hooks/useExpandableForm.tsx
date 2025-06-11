import { AppWidgetMeta } from '@interfaces/widget'
import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { ExpandIconProps } from 'antd/lib/table'
import ExpandIcon from '../components/ExpandIcon'
import ExpandedRow from '../components/ExpandedRow'
import { resetRecordForm, setRecordForm } from '@actions'
import { Spin } from 'antd'
import DebugWidgetWrapper from '../../../DebugWidgetWrapper/DebugWidgetWrapper'
import { FieldType, WidgetFormMeta } from '@cxbox-ui/core'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { RowSelectionType } from 'antd/es/table'
import { getRowSelectionOffset } from '@components/widgets/Table/utils/rowSelection'
import { useInternalWidgetSelector } from '@hooks/useInternalWidgetSelector'

type WidgetMetaField = { type: string; hidden?: boolean }

const EXPAND_ICON_COLUMN = {
    title: '',
    width: '66px',
    key: '_expandIconField'
}

function isExpandColumn<T>(item: ControlColumn<T>) {
    return item.column.key === EXPAND_ICON_COLUMN.key
}

export function useExpandableForm<R extends CustomDataItem>(currentWidgetMeta: AppWidgetMeta) {
    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, isCreateStyle, isEditStyle } = useInternalWidgetSelector(
        currentWidgetMeta,
        'inlineForm'
    )
    const recordForm = useAppSelector(state => state.view.recordForm[currentWidgetMeta.bcName])
    const currentActiveRowId = recordForm?.cursor
    const isActiveRecord = useCallback(
        (record: R) => recordForm?.cursor === record.id && currentWidgetMeta.bcName === recordForm?.bcName,
        [currentWidgetMeta.bcName, recordForm?.bcName, recordForm?.cursor]
    )

    const dispatch = useDispatch()

    const handleExpand = useCallback(
        (expanded, record) => {
            if (expanded) {
                dispatch(
                    setRecordForm({
                        widgetName: currentWidgetMeta.name,
                        cursor: record.id,
                        bcName: currentWidgetMeta.bcName,
                        active: true,
                        create: false
                    })
                )
            } else {
                dispatch(resetRecordForm({ bcName: currentWidgetMeta.bcName }))
            }
        },
        [currentWidgetMeta.bcName, currentWidgetMeta.name, dispatch]
    )

    const expandIcon = useCallback(
        ({ expanded, record, onExpand }: ExpandIconProps<R>) => {
            return (
                <ExpandIcon
                    expanded={isActiveRecord(record) && expanded}
                    openIcon="edit"
                    closeIcon="close"
                    onClick={event => {
                        if (!isActiveRecord(record) && expanded) {
                            handleExpand(true, record)
                        } else if (isActiveRecord(record) && expanded) {
                            handleExpand(false, record)
                        } else {
                            onExpand(record, event)
                        }
                    }}
                />
            )
        },
        [handleExpand, isActiveRecord]
    )

    const isLoading = internalWidget && currentActiveRowId !== internalWidgetActiveCursor

    const expandedRowRender = useCallback(
        (record: R) =>
            isActiveRecord(record) && internalWidget !== undefined ? (
                <DebugWidgetWrapper meta={internalWidget}>
                    <Spin spinning={isLoading}>
                        <ExpandedRow widgetMeta={internalWidget as WidgetFormMeta} operations={internalWidgetOperations} record={record} />
                    </Spin>
                </DebugWidgetWrapper>
            ) : null,
        [isActiveRecord, internalWidget, isLoading, internalWidgetOperations]
    )

    const getExpandIconColumnIndex = (
        controlColumns: ControlColumn<R>[],
        externalVisibleFields?: WidgetMetaField[],
        rowSelectionType?: RowSelectionType
    ) => {
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
        const visibleWidgetFields = externalVisibleFields ?? widgetFields?.filter(item => item.type !== FieldType.hidden && !item.hidden)
        const rowSelectionCount = getRowSelectionOffset(rowSelectionType)

        return leftControlColumns.length + visibleWidgetFields?.length + rightControlColumns.findIndex(isExpandColumn) + rowSelectionCount
    }

    const expandable = !!internalWidget

    return {
        expandable,
        getExpandIconColumnIndex,
        expandIcon: expandable ? expandIcon : undefined,
        expandIconColumn: expandable ? EXPAND_ICON_COLUMN : undefined,
        expandedRowRender: expandable ? expandedRowRender : undefined,
        expandedRowId: expandable ? currentActiveRowId : undefined,
        onExpand: expandable ? handleExpand : undefined,
        isCreateStyle,
        isEditStyle
    }
}
