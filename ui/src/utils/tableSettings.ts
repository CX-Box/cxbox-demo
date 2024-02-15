import { TableSettingsItem, TableSettingsList, TableSettingsMap } from '../interfaces/tableSettings'

export function createSettingPath(setting: Pick<TableSettingsItem, 'view' | 'widget'>) {
    if (!setting.view || !setting.widget) {
        return null
    }

    return `view/${setting.view}/widget/${setting.widget}`
}

export function createSettingMap(rawSettings: TableSettingsList): TableSettingsMap | null {
    return rawSettings
        ? Object.values(rawSettings).reduce((settingMap: TableSettingsMap, setting) => {
              const path = createSettingPath(setting)

              if (path) {
                  settingMap[path] = setting
              }

              return settingMap
          }, {})
        : null
}

export function createMap(array: Record<string, any>[], propertyKey: string) {
    return array.reduce((result, item) => {
        const mapKey = item[propertyKey]

        if (mapKey && typeof mapKey === 'string') {
            result[mapKey] = item
        }

        return result
    }, {})
}
