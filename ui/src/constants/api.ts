import { joinPaths } from '@utils/api'

const isDev = process.env.NODE_ENV === 'development'

export const __API__ = isDev ? process.env.REACT_APP_CXBOX_API_URL_DEV : process.env.REACT_APP_CXBOX_API_URL

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const wsHost = isDev ? 'localhost:8080' : window.location.host

export const __WS_API__ = new URL(__API__ || '', `${wsProtocol}//${wsHost}`).href

export const OIDC_CONFIG_URL = joinPaths(__API__ || '', '/auth/oidc.json')
