import React, { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { actions, BcFilter, DataItem, interfaces, PendingValidationFailsFormat } from '@cxbox-ui/core'
import { FilterType } from '@interfaces/filters'
import { EMPTY_ARRAY } from '@constants'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import Popup from '@components/Popup/Popup'
import Button from '@components/ui/Button/Button'
import UiTitle, { TagType } from '@components/widgets/AssocListPopup/ui/Title'
import TreeTable from '@components/widgets/Table/TreeTable'
import { usePassiveAssociations } from './hooks/usePassiveAssociations'
import { useActiveAssociations } from './hooks/useActiveAssociations'
import { useFilterRecords } from '@components/widgets/AssocListPopup/DefaultAssocListPopup/hooks/useFilterRecords'
import { TreeRowSelectionSource, useTreeRowSelection } from '@components/widgets/Table/tree/hooks/useTreeRowSelection'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import styles from './AssocTreePopup.module.less'

interface AssocTreePopupProps {
    meta: AppWidgetTableMeta
}

function PassiveAssocTreePopup({ meta }: AssocTreePopupProps) {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const assocValueKey = useAppSelector(state => state.view.popupData?.assocValueKey)
    const { values, selectNode, ...treeRowSelection } = usePassiveAssociations(meta.name)

    const onClose = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: meta.bcName }))
    }, [dispatch, meta.bcName])

    const tags = assocValueKey
        ? (values.map(value => ({ ...value, _value: String(value.value ?? ''), _closable: true })) as TagType[])
        : undefined

    return (
        <Popup
            className={styles.container}
            title={<UiTitle title={meta.title} widgetName={meta.name} tags={tags} onClose={value => selectNode(value, false)} />}
            showed
            onCancelHandler={onClose}
            bcName={meta.bcName}
            widgetName={meta.name}
            footer={
                <div className={styles.actions}>
                    <Button data-test-widget-list-close={true} onClick={onClose}>
                        {t('Close')}
                    </Button>
                </div>
            }
        >
            <TreeTable meta={meta} treeRowSelection={{ selectNode, ...treeRowSelection }} disableRowSelection={false} />
        </Popup>
    )
}

function ActiveAssocTreePopup({ meta }: AssocTreePopupProps) {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const treeRowSelection = useActiveAssociations(meta.name, meta.bcName)
    const isOperationInProgress = useOperationInProgress(meta.bcName)
    const { isFullHierarchy, missingFields } = useAppSelector(state => {
        const cursor = state.screen.bo.bc[meta.bcName]?.cursor as string
        const missingFields =
            state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
                ? (state.view.pendingValidationFails as interfaces.PendingValidationFails)?.[meta.bcName]?.[cursor]
                : (state.view.pendingValidationFails as Record<string, string>)

        return {
            isFullHierarchy: !!meta.options?.hierarchyFull,
            missingFields
        }
    })

    const closePopup = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: meta.bcName }))
    }, [dispatch, meta.bcName])

    const cancel = useCallback(() => {
        closePopup()
        if (isFullHierarchy || (missingFields && Object.keys(missingFields).length > 0)) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [meta.bcName] }))
        }
    }, [closePopup, dispatch, isFullHierarchy, meta.bcName, missingFields])

    const save = useCallback(() => {
        const bcNames = meta.options?.hierarchy ? [meta.bcName, ...meta.options.hierarchy.map(item => item.bcName)] : [meta.bcName]

        dispatch(actions.saveAssociations({ bcNames }))
        closePopup()

        if (isFullHierarchy) {
            dispatch(actions.bcCancelPendingChanges({ bcNames: [meta.bcName] }))
        }
    }, [closePopup, dispatch, isFullHierarchy, meta.bcName, meta.options?.hierarchy])

    return (
        <Popup
            className={styles.container}
            title={<UiTitle title={meta.title} widgetName={meta.name} onClose={() => undefined} />}
            showed
            onCancelHandler={cancel}
            bcName={meta.bcName}
            widgetName={meta.name}
            footer={
                <div className={styles.actions}>
                    <Button data-test-widget-list-save={true} loading={isOperationInProgress('saveAssociations')} onClick={save}>
                        {t('Save')}
                    </Button>
                    <Button data-test-widget-list-cancel={true} onClick={cancel}>
                        {t('Cancel')}
                    </Button>
                </div>
            }
        >
            <TreeTable meta={meta} treeRowSelection={treeRowSelection} disableRowSelection={false} />
        </Popup>
    )
}

/** Column filter of a multivalueTree field: the selected records become an equalsOneOf filter of the callee widget */
function FilterAssocTreePopup({ meta }: AssocTreePopupProps) {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { assocValueKey, associateFieldKey, bcFilters, calleeBCName, calleeWidgetName, viewName, calleeFieldKey, filter } =
        useAppSelector(state => {
            const calleeBCName = state.view.popupData?.calleeBCName
            const associateFieldKey = state.view.popupData?.associateFieldKey
            const bcFilters = state.screen.filters?.[calleeBCName!] ?? EMPTY_ARRAY

            return {
                assocValueKey: state.view.popupData?.assocValueKey ?? '',
                associateFieldKey,
                bcFilters,
                calleeBCName,
                calleeWidgetName: state.view.popupData?.calleeWidgetName,
                viewName: state.view.name,
                calleeFieldKey: state.view.popupData?.options?.calleeFieldKey,
                filter: bcFilters.find(filterItem => filterItem.fieldName === associateFieldKey)
            }
        }, shallowEqual)
    const { selectedFilterRecords, handleDeleteTag, handleSelectAll } = useFilterRecords(filter)

    const selectItems = useCallback(
        (selected: boolean, changedRows: Array<Record<string, any>>) => {
            handleSelectAll(selected, [], changedRows as DataItem[])
        },
        [handleSelectAll]
    )
    const selectionSource: TreeRowSelectionSource = useMemo(
        () => ({
            selectItems,
            selectedRowKeys: selectedFilterRecords.map(item => String(item.id))
        }),
        [selectItems, selectedFilterRecords]
    )
    const treeRowSelection = useTreeRowSelection(meta.name, selectionSource)

    const onClose = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: meta.bcName }))
    }, [dispatch, meta.bcName])

    const filterData = useCallback(() => {
        const filterValue = selectedFilterRecords.map(item => item.id)

        if (associateFieldKey && calleeBCName && filterValue.length > 0) {
            const existingFilter = bcFilters.find(filterItem => filterItem.fieldName === calleeFieldKey)

            if (existingFilter) {
                dispatch(actions.bcRemoveFilter({ bcName: calleeBCName, filter: existingFilter as BcFilter }))
            }

            dispatch(
                actions.bcAddFilter({
                    bcName: calleeBCName,
                    filter: {
                        type: FilterType.equalsOneOf,
                        fieldName: associateFieldKey,
                        value: filterValue,
                        viewName,
                        widgetName: calleeWidgetName,
                        assocItems: selectedFilterRecords
                    }
                })
            )
            dispatch(actions.bcForceUpdate({ bcName: calleeBCName }))
        } else if (associateFieldKey && calleeBCName && filter) {
            dispatch(actions.bcRemoveFilter({ bcName: calleeBCName, filter }))
            dispatch(actions.bcForceUpdate({ bcName: calleeBCName, widgetName: filter.widgetName }))
        }

        onClose()
    }, [
        selectedFilterRecords,
        associateFieldKey,
        calleeBCName,
        bcFilters,
        calleeFieldKey,
        dispatch,
        viewName,
        calleeWidgetName,
        filter,
        onClose
    ])

    const tags = selectedFilterRecords.map(item => ({
        ...item,
        _value: String((item as Record<string, unknown>)[assocValueKey] ?? item.id),
        _closable: true
    })) as TagType[]

    return (
        <Popup
            className={styles.container}
            title={<UiTitle title={meta.title} widgetName={meta.name} tags={tags} onClose={handleDeleteTag} />}
            showed
            onCancelHandler={onClose}
            bcName={meta.bcName}
            widgetName={meta.name}
            wrapProps={{ 'data-test-filter-popup': true }}
            footer={
                <div className={styles.actions}>
                    <Button data-test-widget-list-save={true} onClick={filterData}>
                        {t('Save')}
                    </Button>
                    <Button data-test-widget-list-cancel={true} onClick={onClose}>
                        {t('Cancel')}
                    </Button>
                </div>
            }
        >
            <TreeTable meta={meta} treeRowSelection={treeRowSelection} disableRowSelection={false} />
        </Popup>
    )
}

function AssocTreePopup({ meta }: AssocTreePopupProps) {
    const { active, isFilter } = useAppSelector(state => state.view.popupData ?? {}) as { active?: boolean; isFilter?: boolean }

    if (isFilter) {
        return <FilterAssocTreePopup meta={meta} />
    }

    return active ? <ActiveAssocTreePopup meta={meta} /> : <PassiveAssocTreePopup meta={meta} />
}

export default React.memo(AssocTreePopup)
