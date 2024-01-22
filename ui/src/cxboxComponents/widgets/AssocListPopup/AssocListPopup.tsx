import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import Popup, { PopupProps } from '@cxboxComponents/ui/Popup/Popup'
import AssocTable from './AssocTable'
import { Skeleton, Tag } from 'antd'
import styles from '@cxboxComponents/ui/Popup/Popup.less'
import { interfaces, actions } from '@cxbox-ui/core'
import { RootState, useAppSelector } from '@store'
import { useAssocRecords } from '@hooks/useAssocRecords'
import { createMapDispatchToProps } from '@utils/redux'

export interface IAssocListRecord {
    id: string
    vstamp: number
    originalSelected: interfaces.DataValue
    selected: boolean
    value?: interfaces.DataValue
}

export interface IAssocListActions {
    onSave: (bcNames: string[]) => void
    onFilter: (bcName: string, filter: interfaces.BcFilter) => void
    onDeleteTag: (bcName: string, depth: number, widgetName: string, dataItem: interfaces.AssociatedItem, assocValueKey: string) => void
    onDeleteAssociations: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => void
    onRemoveFilter?: (bcName: string, filter: interfaces.BcFilter) => void
    onCancel: () => void
    onClose: () => void
}

export interface IAssocListOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: interfaces.WidgetTableMeta
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
        [cursor: string]: interfaces.PendingDataItem
    }
    data?: interfaces.AssociatedItem[]
    bcFilters?: interfaces.BcFilter[]
    isFilter?: boolean
    calleeBCName?: string
    calleeWidgetName?: string
}

const emptyData: interfaces.AssociatedItem[] = []

type AssociatedItemTag = Omit<interfaces.AssociatedItem, 'vstamp'> & {
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
    assocValueKey = '',
    associateFieldKey = '',
    bcLoading,
    pendingDataChanges,
    isFilter,
    calleeBCName = '',
    calleeWidgetName,
    ...rest
}: IAssocListProps & IAssocListActions) => {
    const pendingBcNames = useMemo(
        () =>
            widget.options?.hierarchy ? [widget.bcName, ...(widget.options?.hierarchy.map(item => item.bcName) || [])] : [widget.bcName],
        [widget.bcName, widget.options?.hierarchy]
    )

    const selectedRecords = useAssocRecords(data, pendingDataChanges)

    const saveData = React.useCallback(() => {
        onSave(pendingBcNames)
        onClose()
    }, [pendingBcNames, onSave, onClose])

    const viewName = useAppSelector(state => {
        return state.view.name
    })

    const filterData = React.useCallback(() => {
        const filterValue = selectedRecords.map(item => item.id)
        if (filterValue.length > 0) {
            onFilter(calleeBCName, {
                type: interfaces.FilterType.equalsOneOf,
                fieldName: associateFieldKey,
                value: filterValue,
                viewName,
                widgetName: calleeWidgetName
            })
        } else {
            const currentFilters = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value
            currentFilters
                ? onRemoveFilter?.(calleeBCName, {
                      type: interfaces.FilterType.equalsOneOf,
                      fieldName: associateFieldKey,
                      value: currentFilters
                  })
                : actions.emptyAction()
        }
        onClose()
    }, [onFilter, onRemoveFilter, bcFilters, onClose, calleeBCName, associateFieldKey, selectedRecords, calleeWidgetName, viewName])

    const cancelData = React.useCallback(() => {
        onCancel()
        onClose()
    }, [onCancel, onClose])

    const handleDeleteTag = React.useCallback(
        (val: interfaces.DataItem) => {
            if (widget.options?.hierarchyGroupDeselection) {
                onDeleteAssociations(widget.bcName, val.id, (val.level as number) + 1, assocValueKey, false)
            }
            onDeleteTag(
                widget.bcName,
                val.level as number,
                widget.name,
                { ...val, _associate: false } as interfaces.AssociatedItem,
                assocValueKey
            )
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
                                    handleDeleteTag(val as interfaces.AssociatedItem)
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

    const defaultTable = <AssocTable meta={widget} disablePagination={true} />

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
            wrapProps={
                isFilter
                    ? {
                          'data-test-filter-popup': true
                      }
                    : undefined
            }
            {...rest}
        >
            {bcLoading ? <Skeleton loading paragraph={{ rows: 5 }} /> : { ...table }}
        </Popup>
    )
}

function mapStateToProps(state: RootState, ownProps: IAssocListOwnProps) {
    const bcName = ownProps.widget?.bcName
    const bc = state.screen.bo.bc[bcName]
    const isFilter = state.view.popupData?.isFilter
    const calleeBCName = state.view.popupData?.calleeBCName || ''
    const calleeWidgetName = state.view.popupData?.calleeWidgetName
    const associateFieldKey = state.view.popupData?.associateFieldKey
    let data = (state.data[bcName] as interfaces.AssociatedItem[]) || emptyData
    const bcFilters = state.screen.filters?.[calleeBCName]
    const filterDataItems = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as interfaces.DataItem[]
    if (isFilter && filterDataItems?.length > 0) {
        data = data?.map(dataItem => {
            if (filterDataItems.includes(dataItem.id as unknown as interfaces.DataItem)) {
                return {
                    ...dataItem,
                    _associate: true
                }
            }

            return dataItem
        })
    }

    return {
        assocValueKey: state.view.popupData?.assocValueKey,
        associateFieldKey: associateFieldKey,
        bcLoading: !!bc?.loading,
        pendingDataChanges: state.view.pendingDataChanges[bcName],
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
                ctx.dispatch(actions.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch(actions.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch(actions.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onClose: () => {
                ctx.dispatch(actions.closeViewPopup({ bcName: ctx.props.bcName }))
                ctx.dispatch(actions.bcRemoveAllFilters({ bcName: ctx.props.bcName }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch(actions.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onSave: (bcNames: string[]) => {
                ctx.dispatch(actions.saveAssociations({ bcNames }))
                if (ctx.props.isFullHierarchy) {
                    ctx.dispatch(actions.bcCancelPendingChanges({ bcNames: [ctx.props.bcName] }))
                }
            },
            onDeleteAssociations: (bcName: string, parentId: string, depth: number, assocValueKey: string, selected: boolean) => {
                ctx.dispatch(actions.changeDescendantsAssociationsFull({ bcName, parentId, depth, assocValueKey, selected }))
            },
            onDeleteTag: (
                bcName: string,
                depth: number,
                widgetName: string,
                dataItem: interfaces.AssociatedItem,
                assocValueKey: string
            ) => {
                ctx.dispatch(
                    actions.changeAssociationFull({
                        bcName,
                        depth,
                        widgetName,
                        dataItem,
                        assocValueKey
                    })
                )
            },
            onFilter: (bcName: string, filter: interfaces.BcFilter) => {
                ctx.dispatch(actions.bcAddFilter({ bcName, filter }))
                ctx.dispatch(actions.bcForceUpdate({ bcName }))
            },
            onRemoveFilter: (bcName: string, filter: interfaces.BcFilter) => {
                ctx.dispatch(actions.bcRemoveFilter({ bcName, filter }))
                ctx.dispatch(actions.bcForceUpdate({ bcName }))
            }
        }
    }
)

/**
 * @category Widgets
 */
const AssocListPopupConnected = connect(mapStateToProps, mapDispatchToProps)(AssocListPopup)

export default AssocListPopupConnected
