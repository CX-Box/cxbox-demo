export const UPLOAD_FILE_STATUS = {
    init: 'init',
    done: 'done',
    uploading: 'uploading',
    error: 'error',
    canceled: 'canceled',
    removed: 'removed',
    notSupportedExtension: 'notSupportedExtension'
} as const

export const PROGRESS_STATUS = {
    normal: 'normal',
    active: 'active',
    success: 'success',
    exception: 'exception',
    canceled: 'canceled'
} as const

export const UPLOAD_TO_PROGRESS_STATUS_MAP = {
    [UPLOAD_FILE_STATUS.init]: PROGRESS_STATUS.active,
    [UPLOAD_FILE_STATUS.uploading]: PROGRESS_STATUS.active,
    [UPLOAD_FILE_STATUS.error]: PROGRESS_STATUS.exception,
    [UPLOAD_FILE_STATUS.done]: PROGRESS_STATUS.success,
    [UPLOAD_FILE_STATUS.removed]: PROGRESS_STATUS.normal,
    [UPLOAD_FILE_STATUS.notSupportedExtension]: PROGRESS_STATUS.canceled,
    [UPLOAD_FILE_STATUS.canceled]: PROGRESS_STATUS.canceled,
    default: PROGRESS_STATUS.normal
} as const

export const PROGRESS_STATUS_COLOR = {
    [PROGRESS_STATUS.active]: '#108ee9',
    [PROGRESS_STATUS.success]: '#87d068',
    [PROGRESS_STATUS.exception]: '#f5222d',
    [PROGRESS_STATUS.canceled]: '#666666'
} as const

export const UPLOAD_TYPE = {
    create: 'create',
    edit: 'edit'
} as const
