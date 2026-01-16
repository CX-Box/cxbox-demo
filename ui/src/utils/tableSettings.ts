import { TableSettingsItem, TableSettingsList, TableSettingsMap } from '../interfaces/tableSettings'
import { WidgetListField } from '@cxbox-ui/schema'

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

export function calculateHiddenFields(
    additionalFields: string[],
    addedToAdditionalFields?: string[],
    removedFromAdditionalFields?: string[]
) {
    let hiddenFields = additionalFields ? [...additionalFields] : []

    hiddenFields = hiddenFields.filter(additionalField => !removedFromAdditionalFields?.includes(additionalField))

    hiddenFields = addedToAdditionalFields?.length ? [...hiddenFields, ...addedToAdditionalFields] : hiddenFields

    return hiddenFields
}

export function calculateFieldsOrder(
    hiddenFields: string[],
    visibleFields: (WidgetListField & {
        disabled?: boolean | undefined
    })[],
    orderFields?: string[]
) {
    const newVisibleFields = visibleFields.filter(visibleField => !hiddenFields.includes(visibleField.key))

    const fieldsDictionary = createMap(newVisibleFields, 'key')

    return orderFields?.length ? orderFields.map(fieldKey => fieldsDictionary[fieldKey]).filter(field => !!field) : newVisibleFields
}
