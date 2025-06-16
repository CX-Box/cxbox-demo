export interface TableSettingsItem {
    id?: string
    view: string
    widget: string
    orderFields: string[]
    addedToAdditionalFields: string[]
    removedFromAdditionalFields: string[]
}

export type TableSettingsList = TableSettingsItem[]

export interface TableSettingsMap {
    [path: string]: TableSettingsItem | null
}
