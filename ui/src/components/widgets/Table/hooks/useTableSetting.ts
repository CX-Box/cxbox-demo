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
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

export function useTableSetting(
    widgetName: string,
    widgetFields: AppWidgetMeta['fields'],
    widgetOptions?: AppWidgetMeta['options'],
    serviceFields?: string[]
) {
    const view = useAppSelector(state => state.view)
    const viewName = view.name
    const additionalFields = widgetOptions?.additional?.fields
    const settingPath = createSettingPath({ view: viewName, widget: widgetName })
    const settingsMap = useAppSelector(state => state.session.tableSettings)
    const setting = settingsMap?.[settingPath as string] ?? null
    const sessionScreens = useAppSelector(state => state.session.screens)
    const { t } = useTranslation()

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
        return (widgetFields as WidgetListField[]).filter(field => !field?.hidden && field.type !== FieldType.hidden)
    }, [widgetFields])

    const updateSetting = useCallback(
        (partialSetting: Partial<Omit<TableSettingsItem, 'view' | 'widget'>>, withoutRequest: boolean = false) => {
            if (settingPath) {
                dispatch(actions.changeTableSettings({ view: viewName, widget: widgetName, ...partialSetting }))

                if (withoutRequest) {
                    return
                }

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
                        response.data?.forEach(item => {
                            if (item.id) {
                                dispatch(actions.changeTableSettings({ view: viewName, widget: widgetName, id: item.id }))
                            }
                        })
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
                updateSetting(currentSetting, true)
            })
        }
    }, [dispatch, settingPath, settingsMap, updateSetting, viewName, widgetName])

    const calculateHiddenFields = useCallback(() => {
        let hiddenFields = additionalFields ? [...additionalFields] : []

        hiddenFields = hiddenFields.filter(additionalField => !setting?.removedFromAdditionalFields?.includes(additionalField))

        hiddenFields = setting?.addedToAdditionalFields?.length ? [...hiddenFields, ...setting.addedToAdditionalFields] : hiddenFields

        return hiddenFields
    }, [additionalFields, setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields])

    const calculateFieldsOrder = useCallback(
        (hiddenFields: string[]) => {
            const newVisibleFields = visibleFields.filter(visibleField => !hiddenFields.includes(visibleField.key))

            const fieldsDictionary = createMap(newVisibleFields, 'key')

            return setting?.orderFields?.length
                ? setting.orderFields.map(fieldKey => fieldsDictionary[fieldKey]).filter(field => !!field)
                : newVisibleFields
        },
        [setting?.orderFields, visibleFields]
    )

    const resultedFields: WidgetListField[] = useMemo(() => {
        const currentAdditionalFields = calculateHiddenFields()

        return calculateFieldsOrder(currentAdditionalFields)
    }, [calculateHiddenFields, calculateFieldsOrder])

    const changeOrderWithMutate = useCallback(<T>(array: T[], oldIndex: number, newIndex: number) => {
        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])
    }, [])

    // Changes the order of fields contained in the meta
    const changeFieldOrder = useCallback(
        (oldIndex: number, newIndex: number) => {
            const newOrderFields = setting?.orderFields?.length ? [...setting.orderFields] : visibleFields.map(item => item.key)

            const currentItem: WidgetListField | undefined = resultedFields[oldIndex]
            const itemFromNewPosition: WidgetListField | undefined = resultedFields[newIndex]

            const firstIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === currentItem?.key
            })

            const secondIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === itemFromNewPosition?.key
            })

            if (!currentItem?.key || serviceFields?.includes(currentItem.key)) {
                message.error(t('Field cannot be moved', { label: currentItem?.label || currentItem?.title }))
                return null
            }

            if (!itemFromNewPosition?.key || serviceFields?.includes(itemFromNewPosition.key)) {
                message.error(
                    t('Transfer space not available', {
                        label: currentItem?.label || currentItem?.title
                    })
                )
                return null
            }

            changeOrderWithMutate(newOrderFields, firstIndex, secondIndex)

            updateSetting({ orderFields: newOrderFields })
        },
        [changeOrderWithMutate, resultedFields, serviceFields, setting?.orderFields, t, updateSetting, visibleFields]
    )

    const createVisibilitySetting = useCallback(
        (fieldKeys: string[], visibility: boolean) => {
            const partialSetting: Partial<Pick<TableSettingsItem, 'addedToAdditionalFields' | 'removedFromAdditionalFields'>> = {}
            const mainFields = fieldKeys.filter(fieldKey => !additionalFields?.includes(fieldKey))
            const newAdditionalFields = fieldKeys.filter(fieldKey => additionalFields?.includes(fieldKey))

            // Returns the visibility of table fields not specified in jsonMeta.options.additional.fields
            if (visibility && mainFields.length) {
                partialSetting.addedToAdditionalFields = setting?.addedToAdditionalFields?.length
                    ? setting.addedToAdditionalFields.filter(fieldKey => !mainFields.includes(fieldKey))
                    : []
            }

            // Returns hiding the fields specified in jsonMeta.options.additional.fields
            if (!visibility && newAdditionalFields.length) {
                partialSetting.removedFromAdditionalFields = setting?.removedFromAdditionalFields?.length
                    ? setting?.removedFromAdditionalFields.filter(fieldKey => !newAdditionalFields.includes(fieldKey))
                    : []
            }

            // Hides fields not specified in jsonMeta.options.additional.fields
            if (!visibility && mainFields.length) {
                partialSetting.addedToAdditionalFields = setting?.addedToAdditionalFields?.length
                    ? [
                          ...setting?.addedToAdditionalFields,
                          ...mainFields.filter(mainField => !setting?.addedToAdditionalFields?.includes(mainField))
                      ]
                    : mainFields
            }

            // Makes the fields specified in jsonMeta.options.additional.fields visible
            if (visibility && newAdditionalFields.length) {
                partialSetting.removedFromAdditionalFields = setting?.removedFromAdditionalFields?.length
                    ? [
                          ...setting?.removedFromAdditionalFields,
                          ...newAdditionalFields.filter(mainField => !setting?.removedFromAdditionalFields?.includes(mainField))
                      ]
                    : newAdditionalFields
            }

            return partialSetting
        },
        [additionalFields, setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields]
    )

    const changeColumnsVisibility = useCallback(
        (fieldKeys: string[], visibility: boolean) => {
            updateSetting(
                createVisibilitySetting(
                    fieldKeys.filter(fieldKey => !serviceFields?.includes(fieldKey)),
                    visibility
                )
            )
        },
        [createVisibilitySetting, serviceFields, updateSetting]
    )

    return {
        showColumnSettings: !!widgetOptions?.additional?.enabled,
        allFields: visibleFields,
        resultedFields,
        currentAdditionalFields: calculateHiddenFields(),
        changeOrder: changeFieldOrder,
        changeColumnsVisibility,
        resetSetting
    }
}
