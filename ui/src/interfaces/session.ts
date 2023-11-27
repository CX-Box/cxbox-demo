import { interfaces } from '@cxbox-ui/core'
import { TableSettingsItem } from '@interfaces/tableSettings'

export interface LoginResponse extends interfaces.LoginResponse {
    userId: string
}

export interface WidgetMeta extends interfaces.WidgetMeta {
    personalFields: TableSettingsItem | null
}

export interface SessionScreen extends interfaces.SessionScreen {
    meta?: ScreenMetaResponse
}

export interface ScreenMetaResponse extends interfaces.ScreenMetaResponse {
    views: ViewMetaResponse[]
}

export interface ViewMetaResponse extends interfaces.ViewMetaResponse {
    widgets: WidgetMeta[]
}
