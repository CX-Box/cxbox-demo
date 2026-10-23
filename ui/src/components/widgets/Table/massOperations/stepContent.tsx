import React from 'react'
import type { MassStepType } from '@components/widgets/Table/massOperations/constants'
import type { MassOperationProcessing } from '@components/widgets/Table/massOperations/stepButtons'
import type { CryptoSettings } from '@components/CryptoGeneratorContent/cryptoFile'
import Confirm from '@components/widgets/Table/massOperations/Confirm/Confirm'
import TitleWithResult from '@components/widgets/Table/massOperations/TiltleWithResult'

export interface MassResultCounts {
    success: number
    fail: number
}

export interface MassStepContentProps {
    widgetName: string
    bcName: string
    operationType: string
    table: React.ReactNode
    resultCounts: MassResultCounts
    /**
     * The step after the current one in the steps of the kind of operation
     */
    nextStep?: MassStepType
    /**
     * Certificates chosen before the confirm, `undefined` until they are chosen
     */
    settings?: CryptoSettings
    /**
     * Keeps the chosen certificates and opens the next step
     */
    onSettingsChosen: (settings: CryptoSettings) => void
    /**
     * The widget of the preInvoke confirm, it can differ from the widget of the table
     */
    confirmWidgetName: string
    /**
     * Called by the confirm instead of sending the action when the rows are processed after the confirm.
     * Gets the sending with the answer of the confirm
     */
    onConfirm: (send: () => void) => void
    /**
     * Sending of the action with the answer of the preInvoke confirm, `undefined` until the confirm is answered
     */
    confirmedSend?: () => void
    /**
     * The processing after the confirm is interrupted before any row: the confirm is shown again
     */
    onConfirmReset: () => void
    /**
     * Called when the processing of the rows starts and ends, the buttons of the step depend on it
     */
    onProcessingChange: (processing?: MassOperationProcessing) => void
}

export interface StepContent {
    /**
     * Shown above the buttons of the step
     */
    title?: React.ReactNode
    content: React.ReactNode
}

/**
 * Content of one step. It is a plain function, not a component or a hook: it is called only for the current step
 * and the kind of operation, so it must not call hooks. State belongs to the components it returns
 */
export type StepContentFactory = (props: MassStepContentProps) => StepContent

export type StepContentFactories = Record<MassStepType, StepContentFactory>

/**
 * Content of the steps of a mass operation. A kind of operation with other content replaces the factories of its steps,
 * see `MassOperationKind`
 */
export const defaultStepContent: StepContentFactories = {
    'Select rows': ({ table }) => ({ content: table }),
    'Review rows': ({ table }) => ({ content: table }),
    'Confirm operation': ({ confirmWidgetName }) => ({ content: <Confirm widgetName={confirmWidgetName} /> }),
    // the step is only in the kinds of operation that sign files, see `cryptoMassOperation`
    'Sign and encrypt': ({ table }) => ({ content: table }),
    'View results': ({ table, resultCounts: { success, fail } }) => ({
        title: <TitleWithResult processed={success + fail} success={success} fail={fail} />,
        content: table
    })
}
