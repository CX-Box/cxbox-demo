import { AppWidgetMeta } from '@interfaces/widget'
import { useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo } from 'react'
import { TableSettingsItem, TableSettingsList } from '@interfaces/tableSettings'
import { createMap, createSettingPath } from '@utils/tableSettings'
import { actions } from '@actions'
import { useAppSelector } from '@store'
import { FieldType, WidgetListField } from '@cxbox-ui/schema'
import { CxBoxApiInstance } from '../../../../api'
import { firstValueFrom } from 'rxjs'

export function useTableSetting(widget: AppWidgetMeta, serviceFields?: string[]) {
    const view = useAppSelector(state => state.view)
    const viewName = view.name
    const widgetName = widget.name
    const additionalFields = widget.options?.additional?.fields
    const settingPath = createSettingPath({ view: viewName, widget: widgetName })
    const settingsMap = useAppSelector(state => state.session.tableSettings)
    const setting = settingsMap?.[settingPath as string] ?? null
    const sessionScreens = useAppSelector(state => state.session.screens)

    const dispatch = useDispatch()

    useEffect(() => {
        if (settingsMap === null && sessionScreens.length > 0) {
            const rawSettings: TableSettingsList = sessionScreens.reduce((acc: TableSettingsList, sessionScreen) => {
                sessionScreen.meta?.views.forEach(currentView => {
                    currentView.widgets.forEach(currentWidget => currentWidget.personalFields && acc.push(currentWidget.personalFields))
                })

                return acc
            }, [])

            dispatch(actions.initTableSettings({ rawSettings }))
        }
    }, [dispatch, sessionScreens, settingPath, settingsMap, view.widgets])

    const visibleFields = useMemo(() => {
        return (widget.fields as WidgetListField[]).filter(field => !field?.hidden && field.type !== FieldType.hidden)
    }, [widget.fields])

    const updateSetting = useCallback(
        (partialSetting: Partial<Omit<TableSettingsItem, 'view' | 'widget'>>) => {
            if (settingPath) {
                dispatch(actions.changeTableSettings({ view: viewName, widget: widgetName, ...partialSetting }))

                Object.keys(partialSetting).forEach(key => {
                    if ((partialSetting as Record<string, any>)[key] === undefined) {
                        delete (partialSetting as Record<string, any>)[key]
                    }
                })
                const data = [
                    {
                        view: viewName,
                        widget: widgetName,
                        orderFields: setting?.orderFields ?? [],
                        addedToAdditionalFields: setting?.addedToAdditionalFields ?? [],
                        removedFromAdditionalFields: setting?.removedFromAdditionalFields ?? [],
                        ...partialSetting
                    }
                ]

                if (!setting?.id) {
                    firstValueFrom(CxBoxApiInstance.createPersonalSetting(data)).then(response => {
                        if (response.data.id) {
                            dispatch(actions.changeTableSettings({ view: viewName, widget: widgetName, id: response.data.id }))
                        }
                    })
                } else {
                    CxBoxApiInstance.updatePersonalSetting(data)
                }
            }
        },
        [
            dispatch,
            setting?.addedToAdditionalFields,
            setting?.id,
            setting?.orderFields,
            setting?.removedFromAdditionalFields,
            settingPath,
            viewName,
            widgetName
        ]
    )

    const resetSetting = useCallback(() => {
        const currentSetting = settingPath ? settingsMap?.[settingPath] : null
        const id = settingPath ? settingsMap?.[settingPath]?.id : null

        dispatch(actions.resetTableSettings({ view: viewName, widget: widgetName }))

        if (currentSetting && id) {
            firstValueFrom(CxBoxApiInstance.deletePersonalSetting(id)).catch(() => {
                updateSetting(currentSetting)
            })
        }
    }, [dispatch, settingPath, settingsMap, updateSetting, viewName, widgetName])

    const calculateCurrentAdditionalFields = useCallback(() => {
        let currentAdditionalFields = additionalFields ? [...additionalFields] : []

        currentAdditionalFields = currentAdditionalFields.filter(
            additionalField => !setting?.removedFromAdditionalFields?.includes(additionalField)
        )

        currentAdditionalFields = setting?.addedToAdditionalFields?.length
            ? [...currentAdditionalFields, ...setting.addedToAdditionalFields]
            : currentAdditionalFields

        return currentAdditionalFields
    }, [additionalFields, setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields])

    const calculateCurrentOrderFields = useCallback(
        (currentAdditionalFields: string[]) => {
            const newVisibleFields = visibleFields.filter(visibleField => !currentAdditionalFields.includes(visibleField.key))

            const fieldsDictionary = createMap(newVisibleFields, 'key')

            return setting?.orderFields?.length
                ? setting.orderFields.map(fieldKey => fieldsDictionary[fieldKey]).filter(field => !!field)
                : newVisibleFields
        },
        [setting?.orderFields, visibleFields]
    )

    const resultedFields: WidgetListField[] = useMemo(() => {
        const currentAdditionalFields = calculateCurrentAdditionalFields()

        return calculateCurrentOrderFields(currentAdditionalFields)
    }, [calculateCurrentAdditionalFields, calculateCurrentOrderFields])

    const changeOrder = useCallback(
        (fromIndex: number, toIndex: number) => {
            const newOrderFields = setting?.orderFields?.length ? [...setting.orderFields] : visibleFields.map(item => item.key)

            const fromItem = resultedFields[fromIndex]
            const toItem = resultedFields[toIndex]

            const firstIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === fromItem?.key
            })
            const secondIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === toItem?.key
            })

            const item = newOrderFields.splice(firstIndex, 1)[0]

            if (serviceFields?.includes(item)) {
                return null
            }

            newOrderFields.splice(secondIndex, 0, item)

            updateSetting({ orderFields: newOrderFields })
        },
        [resultedFields, serviceFields, setting?.orderFields, updateSetting, visibleFields]
    )

    const changeColumnsVisibility = useCallback(
        (fieldKeys: string[], visibility: boolean) => {
            let addedToAdditionalFields
            let removedFromAdditionalFields
            const mainFields = fieldKeys.filter(fieldKey => !additionalFields?.includes(fieldKey))
            const newAdditionalFields = fieldKeys.filter(fieldKey => additionalFields?.includes(fieldKey))

            if (visibility && newAdditionalFields.length) {
                removedFromAdditionalFields = setting?.removedFromAdditionalFields?.length
                    ? [...setting?.removedFromAdditionalFields, ...newAdditionalFields]
                    : newAdditionalFields
            } else if (visibility && mainFields.length) {
                addedToAdditionalFields = setting?.addedToAdditionalFields?.length
                    ? setting.addedToAdditionalFields.filter(fieldKey => !mainFields.includes(fieldKey))
                    : []
            } else if (!visibility && newAdditionalFields.length) {
                removedFromAdditionalFields = setting?.removedFromAdditionalFields?.length
                    ? setting?.removedFromAdditionalFields.filter(fieldKey => !newAdditionalFields.includes(fieldKey))
                    : []
            } else if (!visibility && mainFields.length) {
                addedToAdditionalFields = setting?.addedToAdditionalFields?.length
                    ? [...setting?.addedToAdditionalFields, ...mainFields]
                    : mainFields
            }

            updateSetting({ addedToAdditionalFields, removedFromAdditionalFields })
        },
        [additionalFields, setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields, updateSetting]
    )

    const changeColumnVisibility = useCallback(
        (fieldKey: string, visibility: boolean) => {
            if (serviceFields?.includes(fieldKey)) {
                return null
            }

            changeColumnsVisibility([fieldKey], visibility)
        },
        [changeColumnsVisibility, serviceFields]
    )

    return {
        showColumnSettings: !!widget.options?.additional?.enabled,
        allFields: visibleFields,
        resultedFields,
        currentAdditionalFields: calculateCurrentAdditionalFields(),
        changeOrder,
        changeColumnVisibility,
        changeColumnsVisibility,
        resetSetting
    }
}
