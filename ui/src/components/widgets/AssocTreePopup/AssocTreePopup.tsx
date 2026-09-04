import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { actions, interfaces, PendingValidationFailsFormat } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import Popup from '@components/Popup/Popup'
import Button from '@components/ui/Button/Button'
import UiTitle, { TagType } from '@components/widgets/AssocListPopup/ui/Title'
import TreeTable from '@components/widgets/Table/TreeTable'
import { usePassiveAssociations } from './hooks/usePassiveAssociations'
import { useActiveAssociations } from './hooks/useActiveAssociations'
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

function AssocTreePopup({ meta }: AssocTreePopupProps) {
    const active = useAppSelector(state => state.view.popupData?.active)

    return active ? <ActiveAssocTreePopup meta={meta} /> : <PassiveAssocTreePopup meta={meta} />
}

export default React.memo(AssocTreePopup)
