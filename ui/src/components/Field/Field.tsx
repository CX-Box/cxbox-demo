import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon, Input } from 'antd'
import DatePickerField from '@components/ui/DatePickerField/DatePickerField'
import TextArea from '@components/ui/TextArea/TextArea'
import MultiField from '@components/ui/MultiField/MultiField'
import ReadOnlyField from '@components/ui/ReadOnlyField/ReadOnlyField'
import MultivalueHover from '@components/ui/Multivalue/MultivalueHover'
import cn from 'classnames'
import readOnlyFieldStyles from '@components/ui/ReadOnlyField/ReadOnlyField.module.less'
import CheckboxPicker from '@components/ui/CheckboxPicker/CheckboxPicker'
import RadioButton from '@components/ui/RadioButton/RadioButton'
import styles from './Field.module.less'
import { CustomizationContext } from '@components/View/SimpleView'
import InteractiveInput from '@components/ui/InteractiveInput/InteractiveInput'
import HistoryField from '@components/ui/HistoryField/HistoryField'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { TooltipPlacement } from 'antd/es/tooltip'
import { interfaces, actions } from '@cxbox-ui/core'
import { RootState } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useTranslation } from 'react-i18next'
import FieldErrorPopupWrapper from '@components/FieldErrorPopupWrapper/FieldErrorPopupWrapper'
import { customFields } from '@components/View/View'

interface FieldOwnProps {
    widgetFieldMeta: interfaces.WidgetField
    widgetName: string
    bcName: string
    cursor: string
    data?: interfaces.DataItem
    className?: string
    suffixClassName?: string
    readonly?: boolean
    disableDrillDown?: boolean
    forceFocus?: boolean
    forcedValue?: interfaces.DataValue
    historyMode?: boolean
    tooltipPlacement?: TooltipPlacement
    customProps?: Record<string, any>
    disableHoverError?: boolean
}

interface FieldProps extends FieldOwnProps {
    data: interfaces.DataItem
    pendingValue: interfaces.DataValue
    rowFieldMeta: interfaces.RowMetaField
    metaError: string
    showErrorPopup: boolean
    onChange: (payload: ChangeDataItemPayload) => void
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}

/**
 * Basic set of properties passed to every field type, including custom fields
 */
export interface BaseFieldProps {
    /**
     * Id of currently selected data record
     */
    cursor?: string
    /**
     * Widget name
     */
    widgetName?: string
    /**
     * Field description in widget meta
     */
    meta?: interfaces.WidgetFieldBase
    className?: string
    metaError?: string
    disabled?: boolean
    placeholder?: string
    readOnly?: boolean
    backgroundColor?: string
    onDrillDown?: () => void
}

export interface ChangeDataItemPayload {
    bcName: string
    cursor: string
    dataItem: interfaces.PendingDataItem
}

export const emptyMultivalue: interfaces.MultivalueSingleValue[] = []

const { FieldType } = interfaces

const simpleDiffSupportedFieldTypes = [
    FieldType.input,
    FieldType.text,
    FieldType.hint,
    FieldType.number,
    FieldType.money,
    FieldType.percent,
    FieldType.date,
    FieldType.dateTime,
    FieldType.dateTimeWithSeconds,
    FieldType.checkbox,
    FieldType.pickList,
    FieldType.inlinePickList,
    FieldType.dictionary,
    FieldType.radio
]

const emptyFieldMeta = [] as any

/**
 *
 * @param props
 * @category Components
 */
const Field: FunctionComponent<FieldProps> = ({
    bcName,
    widgetName,
    widgetFieldMeta,
    cursor,
    forcedValue,
    pendingValue,
    data,
    rowFieldMeta,
    disableDrillDown,
    className,
    metaError,
    readonly: readOnly,
    historyMode,
    forceFocus,
    showErrorPopup,
    suffixClassName,
    tooltipPlacement,
    customProps,
    onChange,
    onDrillDown
}) => {
    const { t } = useTranslation()
    const [localValue, setLocalValue] = React.useState<string | null>(null)
    let standardField: React.ReactChild | null = null

    const value = forcedValue ? forcedValue : pendingValue !== undefined ? pendingValue : data?.[widgetFieldMeta.key]

    const disabled = rowFieldMeta ? rowFieldMeta.disabled : true

    const placeholder = rowFieldMeta?.placeholder

    const handleChange = React.useCallback(
        eventValue => {
            const dataItem = { [widgetFieldMeta.key]: eventValue }
            setLocalValue(null)
            onChange({ bcName, cursor, dataItem })
        },
        [bcName, cursor, widgetFieldMeta.key, onChange]
    )

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(event.target.value)
    }, [])

    const bgColor = widgetFieldMeta.bgColorKey ? (data?.[widgetFieldMeta.bgColorKey] as string) : widgetFieldMeta.bgColor

    const handleDrilldown = React.useMemo(() => {
        return !disableDrillDown && widgetFieldMeta.drillDown
            ? () => {
                  onDrillDown(widgetName, data?.id, bcName, widgetFieldMeta.key)
              }
            : undefined
    }, [disableDrillDown, widgetFieldMeta.drillDown, widgetFieldMeta.key, onDrillDown, widgetName, data?.id, bcName])

    const handleInputBlur = React.useCallback(() => {
        if (localValue != null) {
            handleChange(localValue)
        }
    }, [localValue, handleChange])

    const commonProps: BaseFieldProps = {
        cursor,
        widgetName,
        meta: widgetFieldMeta,
        className: cn(className),
        metaError: t(metaError),
        disabled,
        placeholder,
        readOnly,
        backgroundColor: bgColor,
        onDrillDown: handleDrilldown
    }
    const commonInputProps: any = {
        cursor,
        meta: widgetFieldMeta,
        className,
        disabled,
        placeholder,
        readOnly
    }

    Object.keys(commonProps).forEach(key => {
        if ((commonProps as Record<string, any>)[key] === undefined) {
            delete (commonProps as Record<string, any>)[key]
        }
    })

    Object.keys(commonInputProps).forEach(key => {
        if (commonInputProps[key] === undefined) {
            delete commonInputProps[key]
        }
    })

    if (!historyMode && widgetFieldMeta.snapshotKey && simpleDiffSupportedFieldTypes.includes(widgetFieldMeta.type)) {
        return <HistoryField fieldMeta={widgetFieldMeta} data={data} bcName={bcName} cursor={cursor} widgetName={widgetName} />
    }

    const showTime = [FieldType.dateTime, FieldType.dateTimeWithSeconds].includes(widgetFieldMeta.type)
    const showSeconds = widgetFieldMeta.type === FieldType.dateTimeWithSeconds

    switch (widgetFieldMeta.type) {
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.dateTimeWithSeconds:
            standardField = (
                <DatePickerField
                    {...commonProps}
                    onChange={handleChange}
                    value={(value || '').toString()}
                    showTime={showTime}
                    showSeconds={showSeconds}
                />
            )
            break
        case FieldType.text:
            standardField = (
                <TextArea
                    {...commonProps}
                    maxInput={widgetFieldMeta.maxInput}
                    defaultValue={value as any}
                    onChange={handleChange}
                    className={cn({ [readOnlyFieldStyles.error]: metaError })}
                />
            )
            break
        case FieldType.multifield:
            standardField = (
                <MultiField
                    {...commonProps}
                    fields={widgetFieldMeta.fields}
                    data={data}
                    bcName={bcName}
                    cursor={cursor}
                    widgetName={widgetName}
                    style={widgetFieldMeta.style}
                />
            )
            break
        case FieldType.checkbox:
            standardField = (
                <CheckboxPicker
                    {...commonProps}
                    fieldName={widgetFieldMeta.key}
                    fieldLabel={widgetFieldMeta.label as string}
                    value={value}
                    bcName={bcName}
                    cursor={cursor}
                    readonly={readOnly}
                />
            )
            break
        case FieldType.multivalueHover:
            standardField = (
                <MultivalueHover
                    {...commonProps}
                    data={(value || emptyMultivalue) as interfaces.MultivalueSingleValue[]}
                    displayedValue={widgetFieldMeta.displayedKey && data?.[widgetFieldMeta.displayedKey]}
                />
            )
            break
        case FieldType.hint:
            standardField = (
                <ReadOnlyField {...commonProps} className={cn(className, readOnlyFieldStyles.hint)}>
                    {value}
                </ReadOnlyField>
            )
            break
        case FieldType.radio:
            standardField = (
                <RadioButton
                    {...commonProps}
                    value={value as any}
                    values={rowFieldMeta?.values || emptyFieldMeta}
                    onChange={handleChange}
                />
            )
            break
        default:
            standardField = readOnly ? (
                <ReadOnlyField {...commonProps}>{value}</ReadOnlyField>
            ) : (
                <InteractiveInput
                    suffixClassName={cn(styles.inputSuffix, suffixClassName)}
                    suffix={
                        handleDrilldown && (
                            <DrillDown
                                meta={widgetFieldMeta}
                                widgetName={widgetName}
                                cursor={cursor}
                                drillDownComponent={
                                    <div className={styles.inputSuffixContent}>
                                        <Icon type="link" />
                                    </div>
                                }
                                onDrillDown={handleDrilldown}
                            />
                        )
                    }
                    onSuffixClick={handleDrilldown}
                >
                    <Input
                        {...commonInputProps}
                        value={localValue !== null ? localValue : value ? String(value) : ''}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        autoFocus={forceFocus}
                        maxLength={widgetFieldMeta.maxInput}
                    />
                </InteractiveInput>
            )
    }

    const resultField = (
        <CustomizationContext.Consumer>
            {context => {
                const CustomComponent = (customFields as typeof context.customFields)?.[widgetFieldMeta.type]

                if (CustomComponent) {
                    return (
                        <CustomComponent
                            {...commonProps}
                            customProps={customProps}
                            value={value}
                            onBlur={handleInputBlur}
                            onChange={handleChange}
                        />
                    )
                }

                return standardField
            }}
        </CustomizationContext.Consumer>
    )

    if (metaError && showErrorPopup) {
        return (
            <FieldErrorPopupWrapper
                bcName={bcName}
                placement={tooltipPlacement}
                fieldKey={widgetFieldMeta.key}
                cursor={cursor}
                readOnly={readOnly}
            >
                {resultField}
            </FieldErrorPopupWrapper>
        )
    }

    return resultField
}

function mapStateToProps(state: RootState, ownProps: FieldOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const bcCursor = state.screen.bo.bc[ownProps.bcName]?.cursor
    const rowMeta = bcUrl ? state.view.rowMeta[ownProps.bcName]?.[bcUrl] : undefined
    const rowFieldMeta = rowMeta?.fields.find(field => field.key === ownProps.widgetFieldMeta.key) as interfaces.RowMetaField
    const missing =
        state.view.pendingValidationFailsFormat === interfaces.PendingValidationFailsFormat.target
            ? (state.view.pendingValidationFails as interfaces.PendingValidationFails)?.[ownProps.bcName]?.[ownProps.cursor]?.[
                  ownProps.widgetFieldMeta.key
              ]
            : (state.view.pendingValidationFails?.[ownProps.widgetFieldMeta.key] as string)
    const metaError =
        (missing as string) || (ownProps.cursor === bcCursor ? (rowMeta?.errors?.[ownProps.widgetFieldMeta.key] as string) : '')
    const pendingValue = state.view.pendingDataChanges[ownProps.bcName]?.[ownProps.cursor]?.[ownProps.widgetFieldMeta.key]
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const showErrorPopup = widget?.type !== interfaces.WidgetTypes.Form && !ownProps.disableHoverError
    return {
        data: (ownProps.data || state.data[ownProps.bcName]?.find(item => item.id === ownProps.cursor)) as interfaces.DataItem,
        pendingValue,
        rowFieldMeta,
        metaError,
        showErrorPopup
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            return dispatch(actions.changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
        },
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch(actions.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Field)
