export interface OperationPreInvokeCustom {
    type: OperationPreInvokeTypeCustom.custom
    subtype: OperationPreInvokeSubType.confirmWithCustomWidget
    message?: string
    noText?: string
    yesText?: string
    widget?: string
}

export enum OperationPreInvokeTypeCustom {
    custom = 'custom'
}

export enum OperationPreInvokeSubType {
    confirmWithCustomWidget = 'confirmWithCustomWidget'
}
