import React from 'react'
import cn from 'classnames'
import tableStyles from '../Table/Table.less'
import styles from './AssocListPopup.less'
import Pagination from '../../ui/Pagination/Pagination'
import { EMPTY_ARRAY } from '@constants'
import Button from '../../ui/Button/Button'
import { actions, interfaces } from '@cxbox-ui/core'
import { useAppDispatch, useAppSelector } from '@store'
import { useAssocRecords } from '@hooks/useAssocRecords'
import { AssocListPopup } from '@cxboxComponents'
import { useTranslation } from 'react-i18next'

const emptyData: interfaces.AssociatedItem[] = []

interface DefaultAssocListPopupProps {
    meta: interfaces.WidgetTableMeta
}

function DefaultAssocListPopup({ meta }: DefaultAssocListPopupProps) {
    const { bcName } = meta
    const isFullHierarchy = !!meta.options?.hierarchyFull
    //TODO: REWORK, can cause memory leak
    const { associateFieldKey, pendingDataChanges, data, bcFilters, isFilter, calleeBCName, calleeWidgetName, viewName } = useAppSelector(
        state => {
            const isFilter = state.view.popupData?.isFilter
            const calleeBCName = state.view.popupData?.calleeBCName
            const calleeWidgetName = state.view.popupData?.calleeWidgetName
            const associateFieldKey = state.view.popupData?.associateFieldKey
            let data = state.data[bcName] || emptyData
            const bcFilters = state.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY
            const filterDataItems = bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)?.value as interfaces.DataItem[]
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
                associateFieldKey: associateFieldKey,
                pendingDataChanges: state.view.pendingDataChanges[bcName],
                data: data as interfaces.AssociatedItem[],
                bcFilters,
                isFilter,
                calleeBCName,
                calleeWidgetName,
                viewName: state.view.name
            }
        }
    )
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
        (bcName: string, filter: interfaces.BcFilter) => {
            dispatch(actions.bcAddFilter({ bcName, filter }))
            dispatch(actions.bcForceUpdate({ bcName }))
        },
        [dispatch]
    )
    const onRemoveFilter = React.useCallback(
        (bcName: string, filter: interfaces.BcFilter) => {
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
            onFilter(calleeBCName, {
                type: interfaces.FilterType.equalsOneOf,
                fieldName: associateFieldKey,
                value: filterValue,
                viewName,
                widgetName: calleeWidgetName
            })
        } else {
            const currentFilters = bcFilters?.find(filterItem => filterItem.fieldName === associateFieldKey)?.value
            if (associateFieldKey && currentFilters && calleeBCName) {
                onRemoveFilter?.(calleeBCName, {
                    type: interfaces.FilterType.equalsOneOf,
                    fieldName: associateFieldKey,
                    value: currentFilters
                })
            }
        }
        onClose()
    }, [onFilter, onRemoveFilter, bcFilters, onClose, calleeBCName, associateFieldKey, selectedRecords, calleeWidgetName, viewName])

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
