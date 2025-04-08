import { interfaces } from '@cxbox-ui/core'
import { AppWidgetMeta } from '@interfaces/widget'

export enum EFeatureSettingKey {
    filterByRangeEnabled = 'filterByRangeEnabled',
    sortEnabled = 'sortEnabled',
    drillDownTooltip = 'drillDownTooltip',
    multiRoleEnabled = 'multiRoleEnabled',
    notificationMode = 'notificationMode',
    appInfoEnv = 'appInfoEnv',
    appInfoColor = 'appInfoColor',
    appInfoDescription = 'appInfoDescription',
    sideBarWordBreak = 'sideBarWordBreak',
    sideBarSearchEnabled = 'sideBarSearchEnabled'
}

export type FeatureSetting = {
    active: boolean
    cacheLoaderName: string | null
    description: string | null
    displayOrder: string | null
    key: EFeatureSettingKey
    language: string | null
    type: string | null
    value: string | null
}

export interface LoginResponse extends interfaces.LoginResponse {
    userId: string
    featureSettings?: FeatureSetting[]
}

export interface SessionScreen extends interfaces.SessionScreen {
    meta?: ScreenMetaResponse
}

export type NavigationTypes = 'standard'

export interface ScreenMetaResponse extends interfaces.ScreenMetaResponse {
    navigation?: interfaces.ScreenMetaResponse['navigation'] & { type?: NavigationTypes }
    views: ViewMetaResponse[]
}

export interface ViewMetaResponse extends interfaces.ViewMetaResponse {
    widgets: AppWidgetMeta[]
}
