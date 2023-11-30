export const __API__ =
    process.env.NODE_ENV === 'development' ? process.env.REACT_APP_CXBOX_API_URL_DEV : process.env.REACT_APP_CXBOX_API_URL

export const __WS_API__ = `ws://${
    process.env.NODE_ENV === 'production'
        ? document.location.host + process.env.REACT_APP_CXBOX_API_URL
        : document.location.host + process.env.REACT_APP_CXBOX_API_URL_DEV
}`

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY: unknown[] = []

export const opacitySuffix = '33'
