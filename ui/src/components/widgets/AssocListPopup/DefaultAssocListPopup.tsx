import React from 'react'
import cn from 'classnames'
import tableStyles from '../Table/Table.less'
import styles from './AssocListPopup.less'
import Pagination from '../../ui/Pagination/Pagination'
import { EMPTY_ARRAY } from '@constants'
import Button from '../../ui/Button/Button'
import { actions } from '@cxbox-ui/core'
import { useAppDispatch, useAppSelector } from '@store'
import { useAssocRecords } from '@hooks/useAssocRecords'
import { AssocListPopup } from '@cxboxComponents'
import { useTranslation } from 'react-i18next'
import { DataItem } from '@cxbox-ui/schema'
import { AssociatedItem, BcFilter, FilterType, WidgetTableMeta } from '@cxbox-ui/core'
import { shallowEqual } from 'react-redux'

const emptyData: AssociatedItem[] = []

interface DefaultAssocListPopupProps {
    meta: WidgetTableMeta
}

function DefaultAssocListPopup({ meta }: DefaultAssocListPopupProps) {
    const { bcName } = meta
    const isFullHierarchy = !!meta.options?.hierarchyFull
    //TODO: REWORK, can cause memory leak
    const { associateFieldKey, pendingDataChanges, data, bcFilters, isFilter, calleeBCName, calleeWidgetName, viewName, calleeFieldKey } =
        useAppSelector(state => {
            const isFilter = state.view.popupData?.isFilter
            const calleeBCName = state.view.popupData?.calleeBCName
            const calleeWidgetName = state.view.popupData?.calleeWidgetName
            const associateFieldKey = state.view.popupData?.associateFieldKey
            const calleeFieldKey = state.view.popupData?.options?.calleeFieldKey
            let data = state.data[bcName] || emptyData
            const bcFilters = state.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY
            const filterDataItems = bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as DataItem[]
            if (isFilter && filterDataItems?.length > 0) {
                data = data?.map(dataItem => {
                    if (filterDataItems.includes(dataItem.id as unknown as DataItem)) {
                        return {
                            ...dataItem,
                            _associate: true
                        }
                    }

                    return dataItem
                })
            }

            return {
                associateFieldKey: associateFieldKey,
                pendingDataChanges: state.view.pendingDataChanges[bcName],
                data: data as AssociatedItem[],
                bcFilters,
                isFilter,
                calleeBCName,
                calleeWidgetName,
                viewName: state.view.name,
                calleeFieldKey
            }
        }, shallowEqual)
    const selectedRecords = useAssocRecords(data, pendingDataChanges)
    const dispatch = useAppDispatch()
    const onClose = React.useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
    }, [bcName, dispatch, isFullHierarchy])
    const onCancel = React.useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
        onClose()
    }, [bcName, dispatch, isFullHierarchy, onClose])
    const onFilter = React.useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch(actions.bcAddFilter({ bcName, filter }))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [dispatch]
    )
    const onRemoveFilter = React.useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch(actions.bcRemoveFilter({ bcName, filter }))
            dispatch(actions.bcForceUpdate({ bcName, widgetName: filter.widgetName }))
        },
        [dispatch]
    )
    const onSave = React.useCallback(
        (bcName: string, bcNames: string[], isFullHierarchy: boolean) => {
            dispatch(actions.saveAssociations({ bcNames }))
            if (isFullHierarchy) {
                dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
            }
        },
        [dispatch]
    )
    const saveData = React.useCallback(() => {
        const pendingBcNames = meta.options?.hierarchy ? [bcName, ...meta.options?.hierarchy.map(item => item.bcName)] : [bcName]
        onSave(bcName, pendingBcNames, isFullHierarchy)
        onClose()
    }, [meta.options?.hierarchy, bcName, onSave, isFullHierarchy, onClose])

    const filterData = React.useCallback(() => {
        const filterValue = selectedRecords.map(item => item.id)
        if (associateFieldKey && calleeBCName && filterValue.length > 0) {
            const existingFilter = bcFilters.find(filter => {
                return filter.fieldName === calleeFieldKey
            })

            if (existingFilter) {
                dispatch(actions.bcRemoveFilter({ bcName: calleeBCName, filter: existingFilter as BcFilter }))
            }

            onFilter(calleeBCName, {
                type: FilterType.equalsOneOf,
                fieldName: associateFieldKey,
                value: filterValue,
                viewName,
                widgetName: calleeWidgetName
            })
        } else {
            const currentFilters = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value
            if (associateFieldKey && currentFilters && calleeBCName) {
                onRemoveFilter?.(calleeBCName, {
                    type: FilterType.equalsOneOf,
                    fieldName: associateFieldKey,
                    value: currentFilters
                })
            }
        }
        onClose()
    }, [
        selectedRecords,
        associateFieldKey,
        calleeBCName,
        onClose,
        bcFilters,
        onFilter,
        viewName,
        calleeWidgetName,
        calleeFieldKey,
        dispatch,
        onRemoveFilter
    ])

    const { t } = useTranslation()
    return (
        <AssocListPopup
            className={cn(tableStyles.tableContainer, styles.container)}
            widget={meta}
            components={{
                footer: (
                    <>
                        <Pagination meta={meta} />
                        <div className={styles.actions}>
                            <Button data-test-widget-list-save={true} onClick={isFilter ? filterData : saveData}>
                                {t('Save')}
                            </Button>
                            <Button data-test-widget-list-cancel={true} onClick={onCancel}>
                                {t('Cancel')}
                            </Button>
                        </div>
                    </>
                )
            }}
        />
    )
}

export default React.memo(DefaultAssocListPopup)
