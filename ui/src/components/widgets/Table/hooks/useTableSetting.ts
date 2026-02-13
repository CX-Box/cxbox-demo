import { AppWidgetMeta, AppWidgetTableMeta } from '@interfaces/widget'
import { useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo } from 'react'
import { TableSettingsItem, TableSettingsList } from '@interfaces/tableSettings'
import { calculateFieldsOrder, calculateHiddenFields, createSettingPath } from '@utils/tableSettings'
import { actions } from '@actions'
import { useAppDispatch, useAppSelector } from '@store'
import { FieldType, WidgetListField } from '@cxbox-ui/schema'
import { CxBoxApiInstance } from '../../../../api'
import { firstValueFrom } from 'rxjs'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { ControlColumn } from '@components/widgets/Table/Table.interfaces'
import { getRowSelectionOffset } from '@components/widgets/Table/utils/rowSelection'
import { useVisibleFlattenWidgetFields } from '@hooks/widgetGrid'

const changeOrderWithMutate = <T>(array: T[], oldIndex: number, newIndex: number) => {
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])
}

function useTableSettingMap(viewName: string, widgetName: string) {
    const settingPath = createSettingPath({ view: viewName, widget: widgetName })
    const settingsMap = useAppSelector(state => state.session.tableSettings)
    const setting = settingsMap?.[settingPath as string] ?? null

    return { setting, settingPath, settingsMap }
}

function useTableSettingUpdate(widget: AppWidgetMeta) {
    const view = useAppSelector(state => state.view)
    const { setting, settingPath } = useTableSettingMap(view.name, widget.name)
    const dispatch = useAppDispatch()
    return useCallback(
        (partialSetting: Partial<Omit<TableSettingsItem, 'view' | 'widget'>>, withoutRequest: boolean = false) => {
            if (settingPath) {
                dispatch(actions.changeTableSettings({ view: view.name, widget: widget.name, ...partialSetting }))

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
                        view: view.name,
                        widget: widget.name,
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
                                dispatch(actions.changeTableSettings({ view: view.name, widget: widget.name, id: item.id }))
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
            view.name,
            widget.name
        ]
    )
}

function useTableSettingVisibleFields(widget: AppWidgetMeta, blockedFields?: string[]) {
    const allVisibleFields = useVisibleFlattenWidgetFields(widget as AppWidgetTableMeta)

    return useMemo(() => {
        const allFields = (allVisibleFields as (WidgetListField & { disabled?: boolean })[]).filter(
            field => !field?.hidden && field.type !== FieldType.hidden
        )

        blockedFields?.forEach(groupingFieldKey => {
            const groupingFieldIndex = allFields?.findIndex(field => field.key === groupingFieldKey) ?? -1

            if (groupingFieldIndex !== -1) {
                allFields[groupingFieldIndex] = {
                    ...allFields[groupingFieldIndex],
                    disabled: true
                }
            }
        })

        return allFields
    }, [allVisibleFields, blockedFields])
}

export function useTableSetting(
    widget: AppWidgetMeta,
    blockedFields?: string[],
    rowSelectionType?: string,
    controlColumns?: ControlColumn<any>[]
) {
    const view = useAppSelector(state => state.view)
    const viewName = view.name
    const widgetName = widget?.name
    const { setting, settingPath, settingsMap } = useTableSettingMap(viewName, widgetName)
    const additionalFields = widget?.options?.additional?.fields
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

    const visibleFields = useTableSettingVisibleFields(widget, blockedFields)

    const getColumnOffset = useCallback(
        (type: ControlColumn<unknown>['position']) => {
            const rowSelectionOffset = type === 'left' ? getRowSelectionOffset(rowSelectionType) : 0
            const controlColumnsOffset = controlColumns?.filter(column => column.position === type).length ?? 0

            return controlColumnsOffset + rowSelectionOffset
        },
        [controlColumns, rowSelectionType]
    )

    const updateSetting = useTableSettingUpdate(widget)

    const { resultedFields, currentAdditionalFields } = useTableSettingResultedFields(widget)

    // Changes the order of fields contained in the meta
    const changeFieldOrder = useCallback(
        (oldIndex: number, newIndex: number) => {
            const newOrderFields = setting?.orderFields?.length ? [...setting?.orderFields] : visibleFields.map(item => item.key)
            const leftColumnOffset = getColumnOffset('left')

            const currentItem: WidgetListField | undefined = resultedFields[oldIndex - leftColumnOffset]
            const itemFromNewPosition: WidgetListField | undefined = resultedFields[newIndex - leftColumnOffset]

            const firstIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === currentItem?.key
            })

            const secondIndex = newOrderFields.findIndex(fieldKey => {
                return fieldKey === itemFromNewPosition?.key
            })

            if (!currentItem?.key || blockedFields?.includes(currentItem.key) || firstIndex < 0) {
                const controlColumnTitle =
                    firstIndex < 0 ? controlColumns?.[oldIndex - getRowSelectionOffset(rowSelectionType)]?.column?.title : ''

                message.error(t('Field cannot be moved', { label: currentItem?.label || currentItem?.title || controlColumnTitle }))
                return null
            }

            if (!itemFromNewPosition?.key || blockedFields?.includes(itemFromNewPosition.key) || secondIndex < 0) {
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
        [
            setting?.orderFields,
            visibleFields,
            getColumnOffset,
            resultedFields,
            blockedFields,
            updateSetting,
            controlColumns,
            rowSelectionType,
            t
        ]
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
                    fieldKeys.filter(fieldKey => !blockedFields?.includes(fieldKey)),
                    visibility
                )
            )
        },
        [createVisibilitySetting, blockedFields, updateSetting]
    )

    return {
        allFields: visibleFields,
        resultedFields,
        currentAdditionalFields,
        changeOrder: changeFieldOrder,
        changeColumnsVisibility
    }
}

export function useTableSettingReset(widget: AppWidgetMeta) {
    const view = useAppSelector(state => state.view)
    const { settingPath, settingsMap } = useTableSettingMap(view.name, widget.name)
    const dispatch = useAppDispatch()
    const updateSetting = useTableSettingUpdate(widget)

    return useCallback(() => {
        const currentSetting = settingPath ? settingsMap?.[settingPath] : null
        const id = settingPath ? settingsMap?.[settingPath]?.id : null

        dispatch(actions.resetTableSettings({ view: view.name, widget: widget.name }))

        if (currentSetting && id) {
            firstValueFrom(CxBoxApiInstance.deletePersonalSetting(id)).catch(() => {
                updateSetting(currentSetting, true)
            })
        }
    }, [dispatch, settingPath, settingsMap, updateSetting, view.name, widget.name])
}

export function useTableSettingResultedFields(widget: AppWidgetMeta, blockedFields?: string[]) {
    const view = useAppSelector(state => state.view)
    const { setting } = useTableSettingMap(view.name, widget.name)
    const additionalFields = widget?.options?.additional?.fields
    const visibleFields = useTableSettingVisibleFields(widget, blockedFields)

    const currentAdditionalFields = useMemo(
        () => calculateHiddenFields(additionalFields || [], setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields),
        [additionalFields, setting?.addedToAdditionalFields, setting?.removedFromAdditionalFields]
    )

    const resultedFields = useMemo(() => {
        return calculateFieldsOrder(currentAdditionalFields, visibleFields, setting?.orderFields)
    }, [currentAdditionalFields, visibleFields, setting?.orderFields])

    return {
        currentAdditionalFields,
        resultedFields
    }
}
