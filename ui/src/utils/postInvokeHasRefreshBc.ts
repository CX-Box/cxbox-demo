import { OperationPostInvokeAny, OperationPostInvokeRefreshBc, OperationPostInvokeType } from '@cxbox-ui/core'

export const postInvokeHasRefreshBc = (bcName: string, postInvoke: OperationPostInvokeAny | undefined) => {
    if (!postInvoke) {
        return false
    }

    const postInvokeRefreshCurrentBc =
        OperationPostInvokeType.refreshBC === postInvoke.type && (postInvoke as OperationPostInvokeRefreshBc)?.bc === bcName

    const postInvokeTypesWithRefreshBc = (
        [OperationPostInvokeType.waitUntil, OperationPostInvokeType.drillDownAndWaitUntil] as string[]
    ).includes(postInvoke.type)

    return postInvokeRefreshCurrentBc || postInvokeTypesWithRefreshBc
}
