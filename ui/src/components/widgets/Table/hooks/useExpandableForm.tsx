import { AppWidgetMeta } from '@interfaces/widget'
import React, { useCallback } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { ExpandIconProps } from 'antd/lib/table'
import ExpandIcon from '../components/ExpandIcon'
import ExpandedRow from '../components/ExpandedRow'
import { resetRecordForm, setRecordForm } from '@actions'
import { Spin } from 'antd'
import DebugWidgetWrapper from '../../../DebugWidgetWrapper/DebugWidgetWrapper'
import { buildBcUrl } from '@utils/buildBcUrl'
import { WidgetFormMeta, FieldType } from '@cxbox-ui/core'
import { ControlColumn, CustomDataItem } from '@components/widgets/Table/Table.interfaces'

type WidgetMetaField = { type: string; hidden?: boolean }

const EXPAND_ICON_COLUMN = {
    title: '',
    width: '66px',
    key: '_expandIconField'
}

export function useInternalWidgetSelector(externalWidget: AppWidgetMeta) {
    return useAppSelector(state => {
        const widgetNameForCreate = externalWidget.options?.create?.widget
        const widgetNameForEdit = externalWidget.options?.edit?.widget
        const isWidgetForEditIsInline = externalWidget.options?.edit?.style === 'inline'
        const isWidgetForEditIsDisabled = externalWidget.options?.edit?.style === 'none'
        const isWidgetForEditIsInlineForm = externalWidget.options?.edit?.style === 'inlineForm'
        if (isWidgetForEditIsInlineForm && !widgetNameForEdit) {
            console.error(`Widget "name": ${externalWidget.name} has meta inspection warning! 
Inspection Description: options.edit.widget must be set for options.edit.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.edit.style = "inline", because edit widget was not set.`)
        }
        if (isWidgetForEditIsInline && widgetNameForEdit) {
            console.error(`Widget "name": ${externalWidget.name} has meta inspection warning! 
Inspection Description: options.edit.widget must be set for options.edit.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.edit.style = "inline" has higher priority than option.edit.widget`)
        }
        if (isWidgetForEditIsDisabled && widgetNameForEdit) {
            console.error(`Widget "name": ${externalWidget.name} has meta inspection warning! 
Inspection Description: options.edit.widget must be set for options.edit.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.edit.style = "none" has higher priority than option.edit.widget`)
        }

        const widgetForCreate = state.view.widgets.find(widget => widgetNameForCreate === widget?.name) as WidgetFormMeta
        const widgetForEdit =
            !isWidgetForEditIsInline && !isWidgetForEditIsDisabled
                ? (state.view.widgets.find(widget => widgetNameForEdit === widget?.name) as WidgetFormMeta)
                : undefined
        const bcName = (widgetForCreate || widgetForEdit)?.bcName as string
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined
        const bcUrl = bc ? buildBcUrl(bcName, true) : ''

        const rowMeta = state.view.rowMeta?.[bcName]?.[bcUrl]
        const data = state.data[bcName]

        const currentDataItem = data?.find(dataItem => dataItem.id === bc?.cursor)
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

function isExpandColumn<T>(item: ControlColumn<T>) {
    return item.column.key === EXPAND_ICON_COLUMN.key
}

export function useExpandableForm<R extends CustomDataItem>(currentWidgetMeta: AppWidgetMeta) {
    const { internalWidget, internalWidgetOperations, internalWidgetActiveCursor, isCreateStyle, isEditStyle } =
        useInternalWidgetSelector(currentWidgetMeta)
    const recordForm = useAppSelector(state => state.view.recordForm[currentWidgetMeta.bcName])
    const currentActiveRowId = recordForm?.cursor
    const isActiveRecord = useCallback(
        (record: R) => recordForm?.cursor === record.id && currentWidgetMeta.bcName === recordForm?.bcName,
        [currentWidgetMeta.bcName, recordForm?.bcName, recordForm?.cursor]
    )
    const debugMode = useAppSelector(state => state.session.debugMode || false)

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
                <DebugWidgetWrapper debugMode={debugMode} meta={internalWidget}>
                    <Spin spinning={isLoading}>
                        <ExpandedRow widgetMeta={internalWidget} operations={internalWidgetOperations} record={record} />
                    </Spin>
                </DebugWidgetWrapper>
            ) : null,
        [isActiveRecord, internalWidget, debugMode, isLoading, internalWidgetOperations]
    )

    const getExpandIconColumnIndex = (controlColumns: ControlColumn<R>[], externalVisibleFields?: WidgetMetaField[]) => {
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

        return leftControlColumns.length + visibleWidgetFields?.length + rightControlColumns.findIndex(isExpandColumn)
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
