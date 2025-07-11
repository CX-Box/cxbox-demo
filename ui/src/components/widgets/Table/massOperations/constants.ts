import { ButtonProps } from '@components/ui/Button/Button'

export const SUCCESS_COLOR = '#a6eda6'
export const FAIL_COLOR = '#eda6a6'

export const MAX_TAGS_COUNT = 5

export const MASS_OPERATION_BUTTON_TYPES = [
    'next',
    'cancel',
    'back',
    'export',
    'apply',
    'retry',
    'export-failed',
    'close',
    'select-from-file',
    'setting'
] as const

export const AVAILABLE_MASS_STEPS = ['Select rows', 'Review rows', 'Confirm operation', 'View results'] as const

export type MassOperationType = (typeof MASS_OPERATION_BUTTON_TYPES)[number]

export type MassStepType = (typeof AVAILABLE_MASS_STEPS)[number]

export interface MassStep {
    step?: MassStepType
    title?: string
    description?: string
}

export interface MassAdditionalOperation {
    type: MassOperationType
    text?: string
    icon?: string
    hint?: string
    buttonType?: ButtonProps['type']
    disabled?: boolean
    hidden?: boolean
}

export interface MassAdditionalOperationGroup extends MassAdditionalOperation {
    mode?: 'setting'
    groupTitle?: string
    actions: MassAdditionalOperation[]
}

export const isMassOperationGroup = (
    operation: MassAdditionalOperation | MassAdditionalOperationGroup
): operation is MassAdditionalOperationGroup => {
    const group = operation as MassAdditionalOperationGroup
    return group.actions !== undefined && Array.isArray(group.actions)
}

export const operationGroupHasSettingMode = (operation: MassAdditionalOperationGroup) => {
    return isMassOperationGroup(operation) && operation.mode === 'setting'
}

export const MASS_STEPS: MassStep[] = [
    {
        step: 'Select rows'
    },
    {
        step: 'Review rows'
    },
    {
        step: 'Confirm operation'
    },
    {
        step: 'View results'
    }
]

const NEXT_BUTTON: MassAdditionalOperation = { type: 'next', text: 'Next', hidden: true }

const APPLY_BUTTON: MassAdditionalOperation = { type: 'apply', text: 'Apply', hidden: true }

const CANCEL_BUTTON: MassAdditionalOperation = { type: 'cancel', text: 'Cancel', buttonType: 'link', hidden: true }

const BACK_BUTTON: MassAdditionalOperation = { type: 'back', text: 'Back', buttonType: 'link', hidden: true }

const CLOSE_BUTTON: MassAdditionalOperation = { type: 'close', text: 'Close', hidden: true }

const EXPORT_BUTTON: MassAdditionalOperation = { type: 'export', text: 'Export', hidden: true }

const EXPORT_FAILED_BUTTON: MassAdditionalOperation = { type: 'export-failed', text: 'Export failed', hidden: true }

const SELECT_FROM_FILE_BUTTON: MassAdditionalOperation = { type: 'select-from-file', text: 'File', hidden: true }

const RETRY_GROUP_BUTTON: MassAdditionalOperationGroup = {
    type: 'retry',
    text: 'Retry',
    icon: 'menu',
    actions: [EXPORT_FAILED_BUTTON]
}

const SETTINGS_GROUP_BUTTON: MassAdditionalOperationGroup = {
    type: 'setting',
    mode: 'setting',
    text: '',
    icon: 'setting',
    groupTitle: 'Select from',
    actions: [SELECT_FROM_FILE_BUTTON]
}

export const OPERATIONS_ACCESSIBILITY_BY_STEP: Record<MassStepType, Array<MassAdditionalOperation | MassAdditionalOperationGroup>> = {
    'Select rows': [NEXT_BUTTON, CANCEL_BUTTON, SETTINGS_GROUP_BUTTON],
    'Review rows': [NEXT_BUTTON, APPLY_BUTTON, CANCEL_BUTTON, BACK_BUTTON],
    'Confirm operation': [BACK_BUTTON],
    'View results': [CLOSE_BUTTON, EXPORT_BUTTON, RETRY_GROUP_BUTTON]
}
