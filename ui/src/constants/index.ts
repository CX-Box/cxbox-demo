export const __API__ =
    process.env.NODE_ENV === 'development' ? process.env.REACT_APP_CXBOX_API_URL_DEV : process.env.REACT_APP_CXBOX_API_URL

export const __WS_API__ = `ws://${
    process.env.NODE_ENV === 'production'
        ? document.location.host + process.env.REACT_APP_CXBOX_API_URL
        : 'localhost:8080' + process.env.REACT_APP_CXBOX_API_URL_DEV
}`

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
