import React from 'react'
import { AVAILABLE_MASS_STEPS } from '@components/widgets/Table/massOperations/constants'
import { defaultMassOperation } from '@components/widgets/Table/massOperations/massOperationKind'
import type { MassOperationKind } from '@components/widgets/Table/massOperations/massOperationKind'
import type { StepButtonsFactory } from '@components/widgets/Table/massOperations/stepButtons'
import Confirm from '@components/widgets/Table/massOperations/Confirm/Confirm'
import MassCryptoSign from '@components/widgets/Table/massOperations/Crypto/MassCryptoSign'
import { getCryptoGenerator, resolveCryptoGeneratorType } from '@components/CryptoGeneratorContent/cryptoFile'
import type { CryptoGeneratorTypes } from '@interfaces/widget'

const { stepButtons, stepContent } = defaultMassOperation

/**
 * Title of the step "Sign and encrypt" by what the action does, `type` of its `options.cryptoGenerator`
 */
const SIGN_STEP_TITLES: Record<CryptoGeneratorTypes, string> = {
    sign: 'Signing',
    encrypt: 'Encryption',
    signAndEncrypt: 'Signing and encryption',
    encryptAndSign: 'Encryption and signing'
}

/**
 * Buttons of a step where the rows can be processed
 */
const processingStepButtons: StepButtonsFactory = (state, actions) => ({
    // leaving the step during the processing would lose the signed files, the processing is stopped with its own button
    back: { onClick: actions.backToReview, disabled: !!state.processing },
    // while the action is being sent there is nothing to stop
    ...(state.processing?.stop ? { 'interrupt-and-next': { onClick: state.processing.stop } } : {})
})

/**
 * Mass signing and encryption. The certificates are chosen on the step "Sign and encrypt".
 * Without preInvoke the rows are processed there; with preInvoke they are processed on "Confirm operation" after the confirm,
 * so nothing is signed if the confirm is declined
 */
export const cryptoMassOperation: MassOperationKind = {
    getSteps: hasPreInvoke => AVAILABLE_MASS_STEPS.filter(step => hasPreInvoke || step !== 'Confirm operation'),
    getStepTitle: (step, widget, operationType) =>
        step === 'Sign and encrypt' ? SIGN_STEP_TITLES[resolveCryptoGeneratorType(getCryptoGenerator(widget, operationType))] : undefined,
    stepButtons: {
        ...stepButtons,
        'Sign and encrypt': processingStepButtons,
        'Confirm operation': processingStepButtons
    },
    stepContent: {
        ...stepContent,
        'Sign and encrypt': ({ widgetName, bcName, operationType, nextStep, onSettingsChosen, onProcessingChange }) => ({
            content: (
                <MassCryptoSign
                    widgetName={widgetName}
                    bcName={bcName}
                    operationType={operationType}
                    onSettingsChosen={nextStep === 'Confirm operation' ? onSettingsChosen : undefined}
                    onProcessingChange={onProcessingChange}
                />
            )
        }),
        'Confirm operation': props => ({
            content:
                props.confirmedSend && props.settings ? (
                    <MassCryptoSign
                        widgetName={props.widgetName}
                        bcName={props.bcName}
                        operationType={props.operationType}
                        settings={props.settings}
                        confirmedSend={props.confirmedSend}
                        onProcessingChange={props.onProcessingChange}
                        onNothingSent={props.onConfirmReset}
                    />
                ) : (
                    <Confirm widgetName={props.confirmWidgetName} onConfirm={props.onConfirm} />
                )
        })
    }
}
