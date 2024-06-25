import { of } from 'rxjs'
import { AnyAction } from '@reduxjs/toolkit'
import { OperationModalInvokeConfirm, OperationPostInvokeAny, OperationPostInvokeConfirmType, OperationPreInvoke } from '@cxbox-ui/core'
import { actions } from '@actions'

/**
 * Returns an array of observables for handling post- and pre-invokes from any epics handling operations
 *
 * @param widgetName Name of the widget that initiated the operation
 * @param postInvoke Response post-invoke
 * @param preInvoke Response pre-invoke
 * @param operationType Which operation was performed
 * @param bcName
 * @category Utils
 */
export function postOperationRoutine(
    widgetName: string,
    postInvoke: OperationPostInvokeAny,
    preInvoke: OperationPreInvoke,
    operationType: string,
    bcName: string // TODO: Remove in 2.0.0
) {
    const postInvokeConfirm = Object.values(OperationPostInvokeConfirmType).includes(postInvoke?.type as OperationPostInvokeConfirmType)
    const result: AnyAction[] = []
    if (postInvoke) {
        result.push(actions.processPostInvoke({ bcName, postInvoke, widgetName }))
    }
    if (postInvokeConfirm) {
        result.push(
            actions.processPostInvokeConfirm({
                bcName,
                operationType,
                widgetName,
                postInvokeConfirm: postInvoke as OperationModalInvokeConfirm
            })
        )
    }
    if (preInvoke) {
        result.push(
            actions.processPreInvoke({
                bcName,
                operationType,
                widgetName,
                preInvoke
            })
        )
    }
    return result.map(item => of(item))
}
