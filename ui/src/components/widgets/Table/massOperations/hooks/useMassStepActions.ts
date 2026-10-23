import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { BcFilter, utils, WidgetListField } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { selectWidget } from '@selectors/selectors'
import { FIELDS } from '@constants'
import { FilterType } from '@interfaces/filters'
import { AppWidgetMeta } from '@interfaces/widget'
import { filterByConditions } from '@utils/filterByConditions'
import { openNotification } from '@components/NotificationsContainer/utils'
import { useClearAllFilters } from '@components/widgets/Table/hooks/hooks'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import { MassStepType } from '@components/widgets/Table/massOperations/constants'

interface MassStepActionsParams {
    widgetName: string
    bcName: string
    /**
     * Steps of the kind of operation in their order, "next" and "back" go through them
     */
    steps: readonly MassStepType[]
    moveToStep: (step: MassStepType) => void
    hasMassPreInvoke: boolean
    /**
     * Sends the mass action after the table is reloaded without the filters of the user
     */
    sendAfterReload: () => void
    selectFromFile: () => void
}

/**
 * Handlers of the buttons of the mass operation steps. Which buttons a step shows is decided by `stepButtons`.
 */
export const useMassStepActions = ({
    widgetName,
    bcName,
    steps,
    moveToStep,
    hasMassPreInvoke,
    sendAfterReload,
    selectFromFile
}: MassStepActionsParams) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { step, operationType } = useAppSelector(state => state.screen.viewerMode[bcName]) ?? {}
    const postInvoke = useAppSelector(state => state.view.pendingPostInvoke[bcName]?.[operationType as string])
    const viewName = useAppSelector(state => state.view.name)
    const defaultSort = useAppSelector(state => state.screen.bo.bc[bcName]?.defaultSort)
    const filters = useAppSelector(state => state.screen.filters[bcName])
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const { selectedRows } = useRowSelection(widgetName)
    const clearAllFilters = useClearAllFilters(bcName)
    const { exportTable } = useExportTable({
        bcName,
        fields: widget?.fields as WidgetListField[],
        title: widget?.options?.export?.title ?? widget?.title ?? ''
    })

    const changeStep = (type: 'next' | 'back') => {
        const offset = type === 'back' ? -1 : 1
        moveToStep(steps[steps.indexOf(step as MassStepType) + offset])
    }

    const goToNextStep = () => changeStep('next')

    const cancel = () => {
        dispatch(actions.resetViewerMode({ bcName }))
        dispatch(actions.bcRemoveFilter({ bcName, filter: { type: 'equalsOneOf', fieldName: FIELDS.TECHNICAL.ID } as BcFilter }))
    }

    const goToReview = () => {
        dispatch(
            actions.bcAddFilter({
                bcName,
                filter: {
                    type: FilterType.equalsOneOf,
                    value: selectedRows?.map(item => item.id),
                    fieldName: FIELDS.TECHNICAL.ID
                }
            })
        )
        dispatch(actions.bcChangeCursors({ cursorsMap: { [bcName]: null as any } }))
        dispatch(actions.bcForceUpdate({ bcName }))
        changeStep('next')
    }

    const backToSelect = () => {
        changeStep('back')
        clearAllFilters()
    }

    /**
     * From "Review rows" to the next step of the kind of operation. The preInvoke confirm is requested here and shown on "Confirm operation"
     */
    const goFromReview = () => {
        dispatch(actions.bcChangeCursors({ cursorsMap: { [bcName]: null as any } }))
        dispatch(actions.bcAddSorter({ bcName, sorter: utils.parseSorters(defaultSort) || [] }))
        clearAllFilters()
        // the request with preInvoke shows the confirm; without preInvoke only mass signing gets here, it sends the action itself
        hasMassPreInvoke && sendAfterReload()
        goToNextStep()
    }

    const apply = () => {
        clearAllFilters()
        sendAfterReload()
    }

    /**
     * Back from the steps after "Review rows". The preInvoke confirm is closed: "Next" on "Review rows" requests it again
     */
    const backToReview = () => {
        moveToStep('Review rows')
        dispatch(actions.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch(actions.closeViewPopup({ bcName }))
        dispatch(actions.closeConfirmModal())
    }

    const exportRows = (onlyFailed: boolean) => {
        const [failRows] = onlyFailed && selectedRows ? filterByConditions(selectedRows, [item => !item.success]) : []
        const idFilters = filters.filter(filter => filter.fieldName === FIELDS.TECHNICAL.ID)

        exportTable(
            onlyFailed
                ? {
                      total: failRows.length,
                      filters: [
                          ...idFilters,
                          {
                              fieldName: FIELDS.TECHNICAL.ID,
                              value: failRows.map(item => item.id),
                              type: FilterType.equalsOneOf,
                              widgetName,
                              viewName
                          }
                      ]
                  }
                : undefined,
            'mass'
        ).then(() => {
            openNotification({
                type: 'success',
                message: t("File exported. To re-apply the mass operation to these rows, use 'Select from File' on Step 1.")
            })
        })
    }

    const close = () => {
        cancel()

        postInvoke && operationType && dispatch(actions.applyPendingPostInvoke({ postInvoke, bcName, operationType, widgetName }))
    }

    return { selectFromFile, goToReview, cancel, backToSelect, goFromReview, goToNextStep, apply, backToReview, exportRows, close }
}

export type MassStepActions = ReturnType<typeof useMassStepActions>
