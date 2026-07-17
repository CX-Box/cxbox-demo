import React from 'react'
import styles from './Table.less'
import { Popover } from 'antd'
import cn from 'classnames'
import Field from '@components/Field/Field'
import { DataItem } from '@cxbox-ui/core'
import { WidgetListField } from '@cxbox-ui/schema'
import ExpandIcon from '@components/widgets/Table/components/ExpandIcon'
import { CustomDataItem } from '@components/widgets/Table/Table.interfaces'
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { fieldShowCondition, getInternalGroupPath } from '@components/widgets/Table/groupingHierarchy'
import { numberFieldTypes } from '@constants/field'
import { aggCellBgColorRgba, totalRowKey } from './groupingHierarchy/constants'
import { getAggCellBgOpacity } from './groupingHierarchy/utils/aggregation'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import { ROW_KEY } from '@components/widgets/Table/constants'

interface TableCellProps<T extends CustomDataItem> {
    item: WidgetListField | any
    dataItem: T & GroupingHierarchyCommonNode
    isGroupingHierarchy: boolean
    enabledGrouping: boolean
    isEditMode: (record: T) => boolean
    needHideActions: (record: T) => boolean | undefined
    sortedGroupKeys: string[]
    expandedParentRowKeys: string[]
    groupingHierarchyModeAggregate: boolean
    processedMeta: any
    bcName: string
    widgetName: string
    onParentExpand?: (expanded: boolean, expandRowId: string) => void
}

export function TableCell<T extends CustomDataItem>({
    item,
    dataItem,
    isGroupingHierarchy,
    enabledGrouping,
    isEditMode,
    needHideActions,
    sortedGroupKeys,
    expandedParentRowKeys,
    groupingHierarchyModeAggregate,
    processedMeta,
    bcName,
    widgetName,
    onParentExpand
}: TableCellProps<T>) {
    const editMode = isGroupingHierarchy && enabledGrouping ? isEditMode(dataItem) && !needHideActions(dataItem) : isEditMode(dataItem)

    const expandRowId = isGroupingHierarchy ? getInternalGroupPath(item.key, dataItem, sortedGroupKeys) : dataItem[ROW_KEY]
    const expanded = expandedParentRowKeys?.includes(expandRowId) ?? false

    const isGroupingField = !!processedMeta?.options?.groupingHierarchy?.fields?.includes(item.key)
    const aggFunction = dataItem._aggFunctions?.[item.key]
    const groupLevel = dataItem._groupLevel
    let showReadonlyField

    if (groupingHierarchyModeAggregate) {
        showReadonlyField = enabledGrouping
            ? (groupLevel && (sortedGroupKeys[groupLevel - 1] === item.key || aggFunction)) ||
              (!groupLevel && (!sortedGroupKeys.includes(item.key) || !dataItem._parentGroupPath))
            : true
    } else {
        showReadonlyField =
            isGroupingHierarchy && enabledGrouping ? fieldShowCondition(item.key, dataItem, sortedGroupKeys, expandedParentRowKeys) : true
    }

    const showExpandIcon = isGroupingField && dataItem[item.key] && enabledGrouping && showReadonlyField && !!dataItem.children
    const fieldGroupLevel = sortedGroupKeys.findIndex(sortedGroupKey => sortedGroupKey === item.key) + 1
    const countOfRecords = dataItem._countOfRecordsPerLevel?.[fieldGroupLevel] ?? 0
    const counterMode = processedMeta?.options?.groupingHierarchy?.counterMode || 'none'
    const showCounter =
        showExpandIcon && fieldGroupLevel && !editMode && (counterMode === 'always' || (counterMode === 'collapsed' && !expanded))
    const showField = !!showReadonlyField || editMode
    const rightAlignment = numberFieldTypes.includes(item.type) && {
        justifyContent: 'flex-end'
    }

    const field = showField ? (
        <FieldBaseThemeWrapper
            data-test="FIELD"
            data-test-field-type={item.type}
            data-test-field-title={item.label || item.title}
            data-test-field-key={item.key}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                ...rightAlignment
            }}
        >
            {showExpandIcon && (
                <ExpandIcon
                    className={styles.parentExpandIcon}
                    expanded={expanded}
                    onClick={(event: React.MouseEvent) => {
                        event.preventDefault()
                        onParentExpand?.(!expanded, expandRowId)
                    }}
                    openIcon="up"
                    openRotate={90}
                    closeIcon="down"
                />
            )}
            <Field
                data={dataItem as DataItem}
                bcName={bcName}
                cursor={dataItem.id}
                widgetName={widgetName}
                widgetFieldMeta={item as WidgetListField}
                readonly={!editMode}
                forceFocus={editMode}
                className={cn(editMode ? styles.fullWidth : styles.fitContentWidth)}
            />
            {showCounter ? <span className={styles.counter}>({countOfRecords})</span> : null}
        </FieldBaseThemeWrapper>
    ) : null

    if (groupingHierarchyModeAggregate) {
        const backgroundEnabled =
            groupLevel &&
            (!sortedGroupKeys.slice(0, groupLevel).includes(item.key) || dataItem.id === totalRowKey) &&
            !!dataItem._aggFunctions
        const fieldElement = backgroundEnabled ? (
            <div
                className={styles.aggCell}
                style={{
                    backgroundColor: `rgba(${aggCellBgColorRgba}, ${getAggCellBgOpacity(dataItem.id as string, groupLevel)})`
                }}
            >
                {field}
            </div>
        ) : (
            field
        )

        return aggFunction ? (
            <Popover content={aggFunction} trigger="hover">
                {fieldElement}
            </Popover>
        ) : (
            fieldElement
        )
    }

    return field as JSX.Element
}
