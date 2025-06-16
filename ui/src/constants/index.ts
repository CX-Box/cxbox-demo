export const __API__ = import.meta.env.DEV ? import.meta.env.VITE_CXBOX_API_URL_DEV : import.meta.env.VITE_CXBOX_API_URL

export const __WS_API__ = `ws://${
    import.meta.env.PROD
        ? document.location.host + import.meta.env.VITE_CXBOX_API_URL
        : 'localhost:8080' + import.meta.env.VITE_CXBOX_API_URL_DEV
}`

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY: unknown[] = []

export const opacitySuffix = '33'
