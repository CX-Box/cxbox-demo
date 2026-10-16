import type { MassOperationType, MassStepType } from '@components/widgets/Table/massOperations/constants'
import type { OperationsProps } from '@components/widgets/Table/massOperations/Operations'
import type { MassStepActions } from '@components/widgets/Table/massOperations/hooks/useMassStepActions'

/**
 * Processing of the rows on a step before the results, for example mass signing, and then sending of the action.
 * The step cannot be left while it lasts; the button "Stop and send processed" calls `stop`
 */
export interface MassOperationProcessing {
    /**
     * `undefined` when the rows are processed and the action is being sent: there is nothing to stop
     */
    stop?: () => void
}

type ButtonProps = ReturnType<NonNullable<OperationsProps['getOperationProps']>>

/**
 * Buttons shown on a step and their props. A button of `OPERATIONS_ACCESSIBILITY_BY_STEP` that is not here stays hidden
 */
export type StepButtons = Partial<Record<MassOperationType, Omit<ButtonProps, 'hidden'>>>

export interface MassStepState {
    /**
     * The row meta has the action of the mass operation
     */
    hasOperation: boolean
    hasSelectedRows: boolean
    /**
     * The kind of operation has steps between "Review rows" and "View results": the preInvoke confirm, signing
     */
    hasStepsAfterReview: boolean
    /**
     * The rows are processed before the action is sent, `undefined` when nothing is processed
     */
    processing?: MassOperationProcessing
}

/**
 * Buttons of one step. It is a plain function, not a hook: it is called only for the current step and the kind of operation,
 * so it must not call hooks
 */
export type StepButtonsFactory = (state: MassStepState, actions: MassStepActions) => StepButtons

export type StepButtonsFactories = Record<MassStepType, StepButtonsFactory>

/**
 * The action is applied to the selected rows only
 */
const withSelectedRows = (state: MassStepState, onClick: () => void) => (state.hasSelectedRows ? { onClick } : {})

/**
 * Buttons of the steps of a mass operation. A kind of operation with other buttons replaces the factories of its steps,
 * see `MassOperationKind`
 */
export const defaultStepButtons: StepButtonsFactories = {
    'Select rows': (state, actions) => ({
        next: state.hasSelectedRows ? { onClick: actions.goToReview } : { disabled: true },
        cancel: { onClick: actions.cancel },
        'select-from-file': { onClick: actions.selectFromFile }
    }),
    'Review rows': (state, actions) => {
        const buttons: StepButtons = {
            back: { onClick: actions.backToSelect },
            cancel: { onClick: actions.cancel }
        }

        if (!state.hasOperation) {
            return buttons
        }

        // a step before the results (a confirm, signing) is opened with "Next", without it the action is applied at once
        return state.hasStepsAfterReview
            ? { ...buttons, next: withSelectedRows(state, actions.goFromReview) }
            : { ...buttons, apply: withSelectedRows(state, actions.apply) }
    },
    'Confirm operation': (state, actions) => ({
        back: { onClick: actions.backToReview }
    }),
    // the step is only in the kinds of operation that sign files, see `cryptoMassOperation`
    'Sign and encrypt': () => ({}),
    'View results': (state, actions) => ({
        close: { onClick: actions.close },
        export: { onClick: () => actions.exportRows(false) },
        'export-failed': {
            hint: "A file with failed rows will be downloaded. To retry the operation for these rows, upload this file on Step 1 via 'Select from File'",
            onClick: () => actions.exportRows(true)
        }
    })
}

/**
 * A button that is not in the step gets `{}` and stays hidden by `OPERATIONS_ACCESSIBILITY_BY_STEP`
 */
export const getStepButtonProps = (buttons: StepButtons, buttonType: MassOperationType): ButtonProps => {
    const button = buttons[buttonType]
    return button ? { ...button, hidden: false } : {}
}
