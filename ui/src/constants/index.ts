export * from './api'

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY: unknown[] = []

export const opacitySuffix = '33'

export const NAVIGATION_LEVEL_SCREEN = 0

export const FIELDS = {
    TECHNICAL: {
        ID: 'id'
    },
    MASS_OPERATION: {
        ERROR_MESSAGE: 'errorMessage',
        MASS_IDS: 'massIds_'
    }
} as const

export const FIELD_DISABLED_COLOR = '#141F35'
export const WHEN_EDITABLE_FIELD_IS_DISABLED_THEN_FONT_OPACITY = 1
