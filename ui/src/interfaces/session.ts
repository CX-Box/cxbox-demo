import { interfaces } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'

export interface LoginResponse extends interfaces.LoginResponse {
    userId: string
}

export interface SessionScreen extends interfaces.SessionScreen {
    meta?: ScreenMetaResponse
}

export interface ScreenMetaResponse extends interfaces.ScreenMetaResponse {
    views: ViewMetaResponse[]
}

export interface ViewMetaResponse extends interfaces.ViewMetaResponse {
    widgets: AppWidgetMeta[]
}
