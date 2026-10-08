import { AVAILABLE_MASS_STEPS } from '@components/widgets/Table/massOperations/constants'
import { defaultStepButtons } from '@components/widgets/Table/massOperations/stepButtons'
import { defaultStepContent } from '@components/widgets/Table/massOperations/stepContent'
import type { MassStepType } from '@components/widgets/Table/massOperations/constants'
import type { AppWidgetMeta } from '@interfaces/widget'
import type { StepButtonsFactories } from '@components/widgets/Table/massOperations/stepButtons'
import type { StepContentFactories } from '@components/widgets/Table/massOperations/stepContent'

/**
 * How a kind of mass operation looks: its steps, the buttons and the content of every step.
 * A kind with its own behavior takes `defaultMassOperation` and replaces only what differs, see `cryptoMassOperation`
 */
export interface MassOperationKind {
    /**
     * Steps in their order, in the order of `AVAILABLE_MASS_STEPS`
     *
     * @param hasPreInvoke the action asks for a confirmation, it is shown on the step "Confirm operation"
     */
    getSteps: (hasPreInvoke: boolean) => MassStepType[]
    /**
     * Title of a step instead of the name of the step, for example by the settings of the action in the widget meta.
     * `undefined` keeps the name of the step. The result is translated
     */
    getStepTitle?: (step: MassStepType, widget: AppWidgetMeta | undefined, operationType: string | undefined) => string | undefined
    stepButtons: StepButtonsFactories
    stepContent: StepContentFactories
}

export const defaultMassOperation: MassOperationKind = {
    getSteps: hasPreInvoke =>
        AVAILABLE_MASS_STEPS.filter(step => step !== 'Sign and encrypt' && (hasPreInvoke || step !== 'Confirm operation')),
    stepButtons: defaultStepButtons,
    stepContent: defaultStepContent
}
