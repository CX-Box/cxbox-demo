import React from 'react'
import cn from 'classnames'
import { AssocListPopup as CoreAssocListPopup, useAssocRecords, useTranslation } from '@cxbox-ui/core'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import tableStyles from '../Table/Table.less'
import styles from './AssocListPopup.less'
import Pagination from '../../ui/Pagination/Pagination'
import { useDispatch, useSelector } from 'react-redux'
import { $do } from '../../../actions/types'
import { AppState } from '../../../interfaces/storeSlices'
import { BcFilter, FilterType } from '@cxbox-ui/core/interfaces/filters'
import { DataItem } from '@cxbox-ui/core/interfaces/data'
import { AssociatedItem } from '@cxbox-ui/core/interfaces/operation'
import { EMPTY_ARRAY } from '../../../constants/constants'
import Button from '../../ui/Button/Button'

const emptyData: AssociatedItem[] = []

interface AssocListPopupProps {
    meta: WidgetTableMeta
}

function AssocListPopup({ meta }: AssocListPopupProps) {
    const { bcName } = meta
    const isFullHierarchy = !!meta.options?.hierarchyFull
    const { associateFieldKey, pendingDataChanges, data, bcFilters, isFilter, calleeBCName, calleeWidgetName, viewName } = useSelector(
        (store: AppState) => {
            const isFilter = store.view.popupData?.isFilter
            const calleeBCName = store.view.popupData?.calleeBCName
            const calleeWidgetName = store.view.popupData?.calleeWidgetName
            const associateFieldKey = store.view.popupData?.associateFieldKey
            const data = store.data[bcName] || emptyData
            const bcFilters = store.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY
            const filterDataItems = bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as DataItem[]
            if (isFilter && filterDataItems?.length > 0) {
                data?.forEach(dataItem => {
                    if (filterDataItems.includes(dataItem.id as unknown as DataItem)) {
                        dataItem._associate = true
                    }
                })
            }
            return {
                associateFieldKey: associateFieldKey,
                pendingDataChanges: store.view.pendingDataChanges[bcName],
                data: data as AssociatedItem[],
                bcFilters,
                isFilter,
                calleeBCName,
                calleeWidgetName,
                viewName: store.view.name
            }
        }
    )
    const selectedRecords = useAssocRecords(data, pendingDataChanges)
    const dispatch = useDispatch()
    const onClose = React.useCallback(() => {
        dispatch($do.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
    }, [bcName, dispatch, isFullHierarchy])
    const onCancel = React.useCallback(() => {
        dispatch($do.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
        onClose()
    }, [bcName, dispatch, isFullHierarchy, onClose])
    const onFilter = React.useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch($do.bcAddFilter({ bcName, filter }))
            dispatch($do.bcForceUpdate({ bcName }))
        },
        [dispatch]
    )
    const onRemoveFilter = React.useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch($do.bcRemoveFilter({ bcName, filter }))
            dispatch($do.bcForceUpdate({ bcName, widgetName: filter.widgetName }))
        },
        [dispatch]
    )
    const onSave = React.useCallback(
        (bcName: string, bcNames: string[], isFullHierarchy: boolean) => {
            dispatch($do.saveAssociations({ bcNames }))
            if (isFullHierarchy) {
                dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
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
    }, [onFilter, onRemoveFilter, bcFilters, onClose, calleeBCName, associateFieldKey, selectedRecords, calleeWidgetName, viewName])

    const { t } = useTranslation()
    return (
        <CoreAssocListPopup
            className={cn(tableStyles.tableContainer, styles.container)}
            widget={meta}
            components={{
                footer: (
                    <>
                        <Pagination meta={meta} />
                        <div className={styles.actions}>
                            <Button onClick={isFilter ? filterData : saveData}>{t('Save')}</Button>
                            <Button onClick={onCancel}>{t('Cancel')}</Button>
                        </div>
                    </>
                )
            }}
        />
    )
}

export default React.memo(AssocListPopup)
