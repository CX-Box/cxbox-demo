/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CXBOX_API_URL: string
    readonly VITE_CXBOX_API_URL_DEV: string
    readonly VITE_HOST: string
    readonly VITE_NO_SSO: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
