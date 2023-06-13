import React from 'react'
import { connect, useSelector } from 'react-redux'
import { Store } from '@interfaces/store'
import Popup, { PopupProps } from '@teslerComponents/ui/Popup/Popup'
import HierarchyTable from '@teslerComponents/HierarchyTable/HierarchyTable'
import AssocTable from './AssocTable'
import { Skeleton, Tag } from 'antd'
import FullHierarchyTable from '@teslerComponents/FullHierarchyTable/FullHierarchyTable'
import styles from '@teslerComponents/ui/Popup/Popup.less'
import { DataValue } from '@cxbox-ui/schema'
import { BcFilter, FilterType } from '@cxbox-ui/core'
import { AssociatedItem } from '@cxbox-ui/core'
import { WidgetTableMeta } from '@cxbox-ui/core'
import { DataItem, PendingDataItem } from '@cxbox-ui/core'
import { useAssocRecords } from '@cxbox-ui/core'
import { createMapDispatchToProps } from '@cxbox-ui/core'
import { $do } from '@actions/types'

export interface IAssocListRecord {
    id: string
    vstamp: number
    originalSelected: DataValue
    selected: boolean
    value?: DataValue
}

export interface IAssocListActions {
    onSave: (bcNames: string[]) => void
    onFilter: (bcName: string, filter: BcFilter) => void
    onDeleteTag: (bcName: string, depth: number, widgetName: string, dataItem: AssociatedItem, assocValueKey: string) => void
    onDeleteAssociations: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => void
    onRemoveFilter?: (bcName: string, filter: BcFilter) => void
    onCancel: () => void
    onClose: () => void
}

export interface IAssocListOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: WidgetTableMeta
    components?: {
        title?: React.ReactNode
        table?: React.ReactNode
        footer?: React.ReactNode
    }
}

export interface IAssocListProps extends IAssocListOwnProps {
    /**
     * @deprecated TODO: Remove in 2.0.0, now handled by Widget.tsx
     */
    showed?: boolean

    assocValueKey?: string
    associateFieldKey?: string
    bcLoading: boolean
    pendingDataChanges?: {
        [cursor: string]: PendingDataItem
    }
    data?: AssociatedItem[]
    bcFilters?: BcFilter[]
    isFilter?: boolean
    calleeBCName?: string
    calleeWidgetName?: string
}

const emptyData: AssociatedItem[] = []

type AssociatedItemTag = Omit<AssociatedItem, 'vstamp'> & {
    _closable?: boolean
    _value?: string
}

/**
 *
 * @param props
 * @category Widgets
 */
export const AssocListPopup = ({
    onCancel,
    onClose,
    onSave,
    bcFilters,
    onFilter,
    onRemoveFilter,
    onDeleteTag,
    onDeleteAssociations,
    data,
    width,
    components,
    widget,
    assocValueKey,
    associateFieldKey,
    bcLoading,
    pendingDataChanges,
    isFilter,
    calleeBCName,
    calleeWidgetName,
    ...rest
}: IAssocListProps & IAssocListActions) => {
    const pendingBcNames = widget.options?.hierarchy
        ? [widget.bcName, ...widget.options?.hierarchy.map(item => item.bcName)]
        : [widget.bcName]

    const selectedRecords = useAssocRecords(data, pendingDataChanges)

    const saveData = React.useCallback(() => {
        onSave(pendingBcNames)
        onClose()
    }, [pendingBcNames, onSave, onClose])

    const viewName = useSelector((store: Store) => {
        return store.view.name
    })

    const filterData = React.useCallback(() => {
        const filterValue = selectedRecords.map(item => item.id)
        if (filterValue.length > 0) {
            onFilter(calleeBCName, {
                type: FilterType.equalsOneOf,
                fieldName: associateFieldKey,
                value: filterValue,
                viewName,
                widgetName: calleeWidgetName
            })
        } else {
            const currentFilters = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value
            currentFilters
                ? onRemoveFilter?.(calleeBCName, {
                      type: FilterType.equalsOneOf,
                      fieldName: associateFieldKey,
                      value: currentFilters
                  })
                : $do.emptyAction(null)
        }
        onClose()
    }, [onFilter, onRemoveFilter, bcFilters, onClose, calleeBCName, associateFieldKey, selectedRecords, calleeWidgetName, viewName])

    const cancelData = React.useCallback(() => {
        onCancel()
        onClose()
    }, [onCancel, onClose])

    const handleDeleteTag = React.useCallback(
        (val: DataItem) => {
            if (widget.options?.hierarchyGroupDeselection) {
                onDeleteAssociations(widget.bcName, val.id, (val.level as number) + 1, assocValueKey, false)
            }
            onDeleteTag(widget.bcName, val.level as number, widget.name, { ...val, _associate: false } as AssociatedItem, assocValueKey)
        },
        [onDeleteTag, widget, assocValueKey, onDeleteAssociations]
    )

    // Tag values limit
    const tagLimit = 5
    const visibleTags = selectedRecords
        .map(item => ({
            ...item,
            _value: String(item[assocValueKey] || ''),
            _closable: true
        }))
        .slice(0, tagLimit)
    const hiddenTagsCount = selectedRecords.length - tagLimit
    const tags: AssociatedItemTag[] =
        selectedRecords.length > tagLimit
            ? [...visibleTags, { id: 'control', _associate: false, _value: `... ${hiddenTagsCount}` }]
            : selectedRecords.map(item => ({ ...item, _value: String(item[assocValueKey] || ''), _closable: true }))

    const defaultTitle = tags.length ? (
        <div>
            <div>
                <h1 className={styles.title}>{widget.title}</h1>
            </div>
            <div className={styles.tagArea}>
                {assocValueKey &&
                    tags?.map(val => {
                        return (
                            <Tag
                                title={val._value?.toString()}
                                closable={val._closable}
                                id={val.id?.toString()}
                                key={val.id?.toString()}
                                onClose={() => {
                                    handleDeleteTag(val as AssociatedItem)
                                }}
                            >
                                {val._value}
                            </Tag>
                        )
                    })}
            </div>
        </div>
    ) : (
        widget.title
    )

    const title = components?.title === undefined ? defaultTitle : components.title

    const defaultTable =
        widget.options?.hierarchy || widget.options?.hierarchyFull ? (
            widget.options.hierarchyFull ? (
                <FullHierarchyTable meta={widget} assocValueKey={assocValueKey} selectable />
            ) : (
                <HierarchyTable meta={widget} assocValueKey={assocValueKey} selectable />
            )
        ) : (
            <AssocTable meta={widget} disablePagination={true} />
        )

    const table = components?.table === undefined ? defaultTable : components.table

    return (
        <Popup
            title={title}
            showed
            width={width}
            size="large"
            onOkHandler={isFilter ? filterData : saveData}
            onCancelHandler={cancelData}
            bcName={widget.bcName}
            widgetName={widget.name}
            disablePagination={widget.options?.hierarchyFull}
            footer={components?.footer}
            {...rest}
        >
            {bcLoading ? <Skeleton loading paragraph={{ rows: 5 }} /> : { ...table }}
        </Popup>
    )
}

function mapStateToProps(store: Store, ownProps: IAssocListOwnProps) {
    const bcName = ownProps.widget?.bcName
    const bc = store.screen.bo.bc[bcName]
    const isFilter = store.view.popupData.isFilter
    const calleeBCName = store.view.popupData.calleeBCName
    const calleeWidgetName = store.view.popupData.calleeWidgetName
    const associateFieldKey = store.view.popupData.associateFieldKey
    const data = store.data[bcName] || emptyData
    const bcFilters = store.screen.filters?.[calleeBCName]
    const filterDataItems = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as DataItem[]
    if (isFilter && filterDataItems?.length > 0) {
        data?.forEach(dataItem => {
            if (filterDataItems.includes(dataItem.id as unknown as DataItem)) {
                dataItem._associate = true
            }
        })
    }

    return {
        assocValueKey: store.view.popupData.assocValueKey,
        associateFieldKey: associateFieldKey,
        bcLoading: bc?.loading,
        pendingDataChanges: store.view.pendingDataChanges[bcName],
        data: data,
        bcFilters,
        isFilter,
        calleeBCName,
        calleeWidgetName
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: IAssocListOwnProps) => {
        return {
            bcName: props.widget.bcName, // TODO: use widgetName instead
            // widgetName: props.widget.name,
            isFullHierarchy: !!props.widget.options?.hierarchyFull
        }
    },
    (ctx: any): IAssocListActions => {
        return {
            onCancel: () => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch($do.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onClose: () => {
                ctx.dispatch($do.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch($do.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onSave: (bcNames: string[]) => {
                ctx.dispatch($do.saveAssociations({ bcNames }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch($do.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onDeleteAssociations: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => {
                ctx.dispatch($do.changeDescendantsAssociationsFull({ bcName, parentId, depth, assocValueKey, selected }))
            },
            onDeleteTag: (bcName: string, depth: number, widgetName: string, dataItem: AssociatedItem, assocValueKey: string) => {
                ctx.dispatch(
                    $do.changeAssociationFull({
                        bcName,
                        depth,
                        widgetName,
                        dataItem,
                        assocValueKey
                    })
                )
            },
            onFilter: (bcName: string, filter: BcFilter) => {
                ctx.dispatch($do.bcAddFilter({ bcName, filter }))
                ctx.dispatch($do.bcForceUpdate({ bcName }))
            },
            onRemoveFilter: (bcName: string, filter: BcFilter) => {
                ctx.dispatch($do.bcRemoveFilter({ bcName, filter }))
                ctx.dispatch($do.bcForceUpdate({ bcName }))
            }
        }
    }
)

/**
 * @category Widgets
 */
const AssocListPopupConnected = connect(mapStateToProps, mapDispatchToProps)(AssocListPopup)

export default AssocListPopupConnected
