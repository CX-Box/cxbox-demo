import React, { memo, useCallback, useMemo } from 'react'
import Popup from '@components/Popup/Popup'
import { actions, AssociatedItem, BcFilter, WidgetTableMeta } from '@cxbox-ui/core'
import SelectionTable from './SelectionTable'
import Title from '@components/widgets/AssocListPopup/DefaultAssocListPopup/Title'
import { useAppDispatch, useAppSelector } from '@store'
import Pagination from '@components/ui/Pagination/Pagination'
import styles from '@components/widgets/AssocListPopup/AssocListPopup.less'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { EMPTY_ARRAY } from '@constants'
import { DataItem } from '@cxbox-ui/schema'
import { shallowEqual } from 'react-redux'
import { useAssocRecords } from '@hooks/useAssocRecords'
import cn from 'classnames'
import { FilterType } from '@interfaces/filters'

interface DefaultAssocListPopupProps {
    meta: WidgetTableMeta
    isFilter: boolean | undefined
}

const emptyData: AssociatedItem[] = []

function DefaultAssocListPopup({ meta, isFilter }: DefaultAssocListPopupProps) {
    const assocValueKey = useAppSelector(state => state.view.popupData?.assocValueKey ?? '')
    const { t } = useTranslation()

    const { bcName } = meta
    const isFullHierarchy = !!meta.options?.hierarchyFull
    const {
        associateFieldKey,
        pendingDataChanges,
        bcFilters,
        calleeBCName,
        calleeWidgetName,
        viewName,
        calleeFieldKey,
        filterDataItems,
        bcData
    } = useAppSelector(state => {
        const isFilter = state.view.popupData?.isFilter
        const calleeBCName = state.view.popupData?.calleeBCName
        const calleeWidgetName = state.view.popupData?.calleeWidgetName
        const associateFieldKey = state.view.popupData?.associateFieldKey
        const calleeFieldKey = state.view.popupData?.options?.calleeFieldKey
        const bcFilters = state.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY
        const filterDataItems = bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as DataItem[]

        return {
            associateFieldKey: associateFieldKey,
            pendingDataChanges: state.view.pendingDataChanges[bcName],
            bcFilters,
            isFilter,
            calleeBCName,
            calleeWidgetName,
            viewName: state.view.name,
            calleeFieldKey,
            filterDataItems,
            bcData: state.data[bcName] || emptyData
        }
    }, shallowEqual)

    const data = useMemo(() => {
        if (isFilter && filterDataItems?.length > 0) {
            return bcData?.map(dataItem => {
                if (filterDataItems.includes(dataItem.id as unknown as DataItem)) {
                    return {
                        ...dataItem,
                        _associate: true
                    }
                }

                return dataItem
            })
        }

        return bcData
    }, [bcData, filterDataItems, isFilter]) as AssociatedItem[]

    const selectedRecords = useAssocRecords(data, pendingDataChanges)

    const dispatch = useAppDispatch()

    const onClose = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
    }, [bcName, dispatch, isFullHierarchy])

    const onCancel = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
        if (isFullHierarchy) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
        onClose()
    }, [bcName, dispatch, isFullHierarchy, onClose])

    const onFilter = useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch(actions.bcAddFilter({ bcName, filter }))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [dispatch]
    )

    const onRemoveFilter = useCallback(
        (bcName: string, filter: BcFilter) => {
            dispatch(actions.bcRemoveFilter({ bcName, filter }))
            dispatch(actions.bcForceUpdate({ bcName, widgetName: filter.widgetName }))
        },
        [dispatch]
    )

    const onSave = useCallback(
        (bcName: string, bcNames: string[], isFullHierarchy: boolean) => {
            dispatch(actions.saveAssociations({ bcNames }))
            if (isFullHierarchy) {
                dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
            }
        },
        [dispatch]
    )

    const saveData = useCallback(() => {
        const pendingBcNames = meta.options?.hierarchy ? [bcName, ...meta.options?.hierarchy.map(item => item.bcName)] : [bcName]
        onSave(bcName, pendingBcNames, isFullHierarchy)
        onClose()
    }, [meta.options?.hierarchy, bcName, onSave, isFullHierarchy, onClose])

    const filterData = useCallback(() => {
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

    return (
        <Popup
            className={cn(styles.container)}
            title={<Title title={meta.title} widgetName={meta.name} assocValueKey={assocValueKey} bcName={meta.bcName} />}
            showed
            size="large"
            onCancelHandler={onCancel}
            bcName={meta.bcName}
            widgetName={meta.name}
            footer={
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
            }
            wrapProps={isFilter ? { 'data-test-filter-popup': true } : undefined}
        >
            <SelectionTable meta={meta} disablePagination={true} />
        </Popup>
    )
}

export default memo(DefaultAssocListPopup)
