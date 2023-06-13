import React, { useCallback, useContext } from 'react'
import { useDispatch } from 'react-redux'
import {
    WidgetField,
    DataItem,
    useDataProps,
    PendingDataItem,
    useWidgetProps,
    useRowMetaProps,
    useDrillDownUrl,
    usePendingProps,
    DataValue,
    $do
} from '@cxbox-ui/core'
import { CustomizationContext } from '@newTeslerComponents/View/View.context'

interface StoreStateProps {
    widgetName: string
    widgetField: WidgetField
    forcedCursor?: string
    forcedData?: DataItem
    forcedValue?: DataValue
}

export function useStoreState({ forcedValue, forcedData, forcedCursor, widgetName, widgetField }: StoreStateProps) {
    const { bcName } = useWidgetProps(widgetName)
    const { rowMeta, rowMetaFields } = useRowMetaProps({ bcName, includeSelf: true })
    const { data } = useDataProps({ bcName })
    const { currentPendingValidationFails, currentPendingChange } = usePendingProps({ bcName })

    const fieldError = (currentPendingValidationFails?.[widgetField.key] as string) || rowMeta?.errors?.[widgetField.key]
    const fieldPendingValue = currentPendingChange?.[widgetField.key]
    const currentBcData = forcedData || data?.find(item => item.id === forcedCursor)
    const rowMetaField = rowMetaFields.find(field => field.key === widgetField.key)

    const value = forcedValue ? forcedValue : fieldPendingValue !== undefined ? fieldPendingValue : currentBcData?.[widgetField.key]
    const disabled = rowMetaField ? rowMetaField.disabled : true
    const placeholder = rowMetaField?.placeholder
    const backgroundColor = widgetField.bgColorKey ? (currentBcData?.[widgetField.bgColorKey] as string) : widgetField.bgColor

    return {
        fieldError,
        fieldPendingValue,
        currentBcData,
        rowMetaField,
        value,
        disabled,
        placeholder,
        backgroundColor
    }
}

export interface ChangeDataItemPayload {
    bcName: string
    cursor: string
    dataItem: PendingDataItem
}

function useStoreActions() {
    const dispatch = useDispatch()

    const changeData = useCallback((payload: ChangeDataItemPayload) => dispatch($do.changeDataItem(payload)), [dispatch])

    const drillDown = useCallback(
        (currentWidgetName: string, currentCursor: string, currentBcName: string, fieldKey: string) =>
            dispatch($do.userDrillDown({ widgetName: currentWidgetName, cursor: currentCursor, bcName: currentBcName, fieldKey })),
        [dispatch]
    )

    return {
        changeData,
        drillDown
    }
}

interface FormHandlerProps {
    widgetName: string
    widgetField: WidgetField
    cursor: string
    bcName: string
    disableDrillDown?: boolean
    data: DataItem
    value: DataValue
}

export function useFieldHandlers({ bcName, widgetName, widgetField, cursor, data, disableDrillDown, value }: FormHandlerProps) {
    const { drillDown, changeData } = useStoreActions()

    const [localValue, setLocalValue] = React.useState(null)

    const handleChange = React.useCallback(
        eventValue => {
            const dataItem = { [widgetField.key]: eventValue }

            setLocalValue(null)

            changeData({ bcName, cursor, dataItem })
        },
        [bcName, cursor, widgetField.key, changeData]
    )

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(event.target.value)
    }, [])

    const drillDownUrl = useDrillDownUrl(bcName, widgetField, cursor)

    const handleDrillDown = React.useMemo(() => {
        return !disableDrillDown && drillDownUrl
            ? () => {
                  drillDown(widgetName, data?.id, bcName, widgetField.key)
              }
            : null
    }, [disableDrillDown, drillDownUrl, widgetName, data?.id, bcName, widgetField.key, drillDown])

    const handleInputBlur = React.useCallback(() => {
        if (localValue !== null) {
            handleChange(localValue)
        }
    }, [localValue, handleChange])

    const inputValue = localValue !== null ? localValue : value ? String(value) : ''

    return {
        handleChange,
        handleDrillDown,
        handleBlur: handleInputBlur,
        inputProps: {
            onChange: handleInputChange,
            onBlur: handleInputBlur,
            value: inputValue
        }
    }
}

export function useCustomFields(widgetField: WidgetField) {
    const { customFields } = useContext(CustomizationContext)
    const customFieldComponent = customFields?.[widgetField.type] || customFields?.[widgetField.key]

    return {
        CustomFieldComponent: customFieldComponent,
        customFieldExist: !!customFieldComponent
    }
}
