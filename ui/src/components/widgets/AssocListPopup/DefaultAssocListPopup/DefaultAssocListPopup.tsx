import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual } from 'react-redux'
import cn from 'classnames'
import Button from '@components/ui/Button/Button'
import Pagination from '@components/ui/Pagination/Pagination'
import Popup from '@components/Popup/Popup'
import SelectionTable from './components/SelectionTable'
import Title from './components/Title'
import AssocSelectionTable from './components/AssocSelectionTable'
import AssocTitle from './components/AssocTitle'
import { useAppDispatch, useAppSelector } from '@store'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { useFilterRecords } from './hooks/useFilterRecords'
import { EMPTY_ARRAY } from '@constants'
import { actions, BcFilter, interfaces, PendingValidationFailsFormat, WidgetTableMeta } from '@cxbox-ui/core'
import { FilterType } from '@interfaces/filters'
import styles from '@components/widgets/AssocListPopup/AssocListPopup.less'

interface DefaultAssocListPopupProps {
    meta: WidgetTableMeta
    isFilter: boolean | undefined
}

function DefaultAssocListPopup({ meta, isFilter }: DefaultAssocListPopupProps) {
    const assocValueKey = useAppSelector(state => state.view.popupData?.assocValueKey ?? '')
    const { t } = useTranslation()

    const { bcName } = meta
    const isFullHierarchy = !!meta.options?.hierarchyFull
    const { associateFieldKey, bcFilters, calleeBCName, calleeWidgetName, viewName, calleeFieldKey, missingFields, popupBcName, filter } =
        useAppSelector(state => {
            const calleeBCName = state.view.popupData?.calleeBCName
            const calleeWidgetName = state.view.popupData?.calleeWidgetName
            const associateFieldKey = state.view.popupData?.associateFieldKey
            const calleeFieldKey = state.view.popupData?.options?.calleeFieldKey
            const popupBcName = state.view.popupData?.bcName
            const bcFilters = state.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY
            const filter = bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)
            const cursor = state.screen.bo.bc[bcName]?.cursor as string
            const missingFields =
                state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
                    ? (state.view.pendingValidationFails as interfaces.PendingValidationFails)?.[bcName]?.[cursor]
                    : (state.view.pendingValidationFails as Record<string, string>)

            return {
                associateFieldKey: associateFieldKey,
                bcFilters,
                calleeBCName,
                calleeWidgetName,
                viewName: state.view.name,
                calleeFieldKey,
                missingFields,
                popupBcName,
                filter
            }
        }, shallowEqual)

    const dispatch = useAppDispatch()

    const isOperationInProgress = useOperationInProgress(popupBcName || '')

    const { selectedFilterRecords, handleSelect, handleDeleteTag, handleSelectAll } = useFilterRecords(filter)

    const onClose = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName }))
        if (isFullHierarchy || (missingFields && Object.keys(missingFields).length)) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        }
    }, [bcName, dispatch, isFullHierarchy, missingFields])

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
        const filterValue = selectedFilterRecords.map(item => item.id)
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
                widgetName: calleeWidgetName,
                assocItems: selectedFilterRecords
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
        selectedFilterRecords,
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
            title={
                <>
                    {isFilter ? (
                        <Title
                            title={meta.title}
                            widgetName={meta.name}
                            assocValueKey={assocValueKey}
                            selectedRecords={selectedFilterRecords}
                            onDelete={handleDeleteTag}
                        />
                    ) : (
                        <AssocTitle title={meta.title} widgetName={meta.name} assocValueKey={assocValueKey} bcName={meta.bcName} />
                    )}
                </>
            }
            showed
            size="large"
            onCancelHandler={onClose}
            bcName={meta.bcName}
            widgetName={meta.name}
            footer={
                <>
                    <Pagination meta={meta} />
                    <div className={styles.actions}>
                        <Button
                            data-test-widget-list-save={true}
                            loading={isOperationInProgress('saveAssociations')}
                            onClick={isFilter ? filterData : saveData}
                        >
                            {t('Save')}
                        </Button>
                        <Button data-test-widget-list-cancel={true} onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </>
            }
            wrapProps={isFilter ? { 'data-test-filter-popup': true } : undefined}
        >
            {isFilter ? (
                <SelectionTable meta={meta} selectedRecords={selectedFilterRecords} onSelect={handleSelect} onSelectAll={handleSelectAll} />
            ) : (
                <AssocSelectionTable meta={meta} />
            )}
        </Popup>
    )
}

export default memo(DefaultAssocListPopup)
