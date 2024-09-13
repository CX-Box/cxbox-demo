import React, { FunctionComponent, useCallback } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Form, Icon, Input, Tooltip } from 'antd'
import DatePickerField from '@cxboxComponents/ui/DatePickerField/DatePickerField'
import NumberInput from '@cxboxComponents/ui/NumberInput/NumberInput'
import { NumberTypes } from '@cxboxComponents/ui/NumberInput/formaters'
import TextArea from '@cxboxComponents/ui/TextArea/TextArea'
import Dictionary from '@cxboxComponents/ui/Dictionary/Dictionary'
import MultivalueField from '@cxboxComponents/Multivalue/MultivalueField'
import MultiField from '@cxboxComponents/ui/MultiField/MultiField'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'
import PickListField from '@cxboxComponents/PickListField/PickListField'
import InlinePickList from '@cxboxComponents/InlinePickList/InlinePickList'
import MultivalueHover from '@cxboxComponents/ui/Multivalue/MultivalueHover'
import cn from 'classnames'
import readOnlyFieldStyles from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField.less'
import CheckboxPicker from '@cxboxComponents/ui/CheckboxPicker/CheckboxPicker'
import RadioButton from '@cxboxComponents/ui/RadioButton/RadioButton'
import styles from './Field.less'
import { CustomizationContext } from '@cxboxComponents/View/View'
import { InteractiveInput } from '@cxboxComponents/ui/InteractiveInput/InteractiveInput'
import HistoryField from '@cxboxComponents/ui/HistoryField/HistoryField'
import { TooltipPlacement } from 'antd/es/tooltip'
import { interfaces } from '@cxbox-ui/core'
import { RootState } from '@store'
import { useDrillDownUrl } from '@hooks/useDrillDownUrl'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useTranslation } from 'react-i18next'
import { actions } from '@actions'

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
    activeBc: string | null
    data: interfaces.DataItem
    pendingValue: interfaces.DataValue
    rowFieldMeta: interfaces.RowMetaField
    metaError: string
    showErrorPopup: boolean
    onChange: (payload: ChangeDataItemPayload) => void
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    changeActiveBc: (bcName: string) => void
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
export const Field: FunctionComponent<FieldProps> = ({
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
    onDrillDown,
    changeActiveBc,
    activeBc
}) => {
    const { t } = useTranslation()
    const [localValue, setLocalValue] = React.useState<string | null>(null)
    let resultField: React.ReactChild | null = null
    const drillDownUrl = useDrillDownUrl(bcName, widgetFieldMeta, cursor)

    const value = forcedValue ? forcedValue : pendingValue !== undefined ? pendingValue : data?.[widgetFieldMeta.key]

    const disabled = rowFieldMeta ? rowFieldMeta.disabled : true

    const placeholder = rowFieldMeta?.placeholder

    const updateActiveBc = useCallback(() => {
        if (activeBc !== bcName) {
            changeActiveBc(bcName)
        }
    }, [activeBc, bcName, changeActiveBc])

    const handleChange = React.useCallback(
        eventValue => {
            updateActiveBc()

            if (bcName === activeBc) {
                const dataItem = { [widgetFieldMeta.key]: eventValue }
                setLocalValue(null)
                onChange({ bcName, cursor, dataItem })
            }
        },
        [updateActiveBc, bcName, activeBc, widgetFieldMeta.key, onChange, cursor]
    )

    const handleInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateActiveBc()

            if (bcName === activeBc) {
                setLocalValue(event.target.value)
            }
        },
        [activeBc, bcName, updateActiveBc]
    )

    const bgColor = widgetFieldMeta.bgColorKey ? (data?.[widgetFieldMeta.bgColorKey] as string) : widgetFieldMeta.bgColor

    const handleDrilldown = React.useMemo(() => {
        return !disableDrillDown && drillDownUrl
            ? () => {
                  onDrillDown(widgetName, data?.id, bcName, widgetFieldMeta.key)
              }
            : undefined
    }, [disableDrillDown, drillDownUrl, widgetName, data?.id, bcName, widgetFieldMeta.key, onDrillDown])

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
            resultField = (
                <DatePickerField
                    {...commonProps}
                    onChange={handleChange}
                    value={(value || '').toString()}
                    showTime={showTime}
                    showSeconds={showSeconds}
                />
            )
            break
        case FieldType.number:
            resultField = (
                <NumberInput
                    {...commonProps}
                    value={value as number}
                    type={NumberTypes.number}
                    digits={widgetFieldMeta.digits}
                    nullable={widgetFieldMeta.nullable}
                    onChange={handleChange}
                    forceFocus={forceFocus}
                />
            )
            break
        case FieldType.money:
            resultField = (
                <NumberInput
                    {...commonProps}
                    value={value as number}
                    type={NumberTypes.money}
                    digits={widgetFieldMeta.digits}
                    nullable={widgetFieldMeta.nullable}
                    onChange={handleChange}
                    forceFocus={forceFocus}
                />
            )
            break
        case FieldType.percent:
            resultField = (
                <NumberInput
                    {...commonProps}
                    value={value as number}
                    type={NumberTypes.percent}
                    digits={widgetFieldMeta.digits}
                    nullable={widgetFieldMeta.nullable}
                    onChange={handleChange}
                    forceFocus={forceFocus}
                />
            )
            break
        case FieldType.dictionary:
            resultField = (
                <Dictionary
                    {...commonProps}
                    value={value as any}
                    values={rowFieldMeta ? (rowFieldMeta.values as Array<{ value: string; icon?: string }>) : []}
                    fieldName={widgetFieldMeta.key}
                    onChange={handleChange}
                    multiple={widgetFieldMeta.multiple}
                />
            )
            break
        case FieldType.text:
            resultField = (
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
            resultField = (
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
        case FieldType.multivalue:
            resultField = (
                <MultivalueField
                    {...commonProps}
                    widgetName={widgetName}
                    defaultValue={
                        Array.isArray(value) && value.length > 0 ? (value as interfaces.MultivalueSingleValue[]) : emptyMultivalue
                    }
                    widgetFieldMeta={widgetFieldMeta}
                    bcName={bcName}
                />
            )
            break
        case FieldType.pickList: {
            const pickListField = (
                <PickListField
                    {...commonProps}
                    parentBCName={bcName}
                    bcName={widgetFieldMeta.popupBcName}
                    cursor={cursor}
                    value={value as any}
                    pickMap={widgetFieldMeta.pickMap}
                />
            )
            resultField = readOnly ? (
                pickListField
            ) : (
                <InteractiveInput suffix={handleDrilldown && <Icon type="link" />} onSuffixClick={handleDrilldown}>
                    {pickListField}
                </InteractiveInput>
            )
            break
        }
        case FieldType.inlinePickList: {
            const pickListField = (
                <InlinePickList
                    {...commonProps}
                    fieldName={widgetFieldMeta.key}
                    searchSpec={widgetFieldMeta.searchSpec}
                    bcName={bcName}
                    popupBcName={widgetFieldMeta.popupBcName}
                    cursor={cursor}
                    value={value as string}
                    pickMap={widgetFieldMeta.pickMap}
                />
            )
            resultField = readOnly ? (
                pickListField
            ) : (
                <InteractiveInput suffix={handleDrilldown && <Icon type="link" />} onSuffixClick={handleDrilldown}>
                    {pickListField}
                </InteractiveInput>
            )
            break
        }
        case FieldType.checkbox:
            resultField = (
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
            resultField = (
                <MultivalueHover
                    {...commonProps}
                    data={(value || emptyMultivalue) as interfaces.MultivalueSingleValue[]}
                    displayedValue={widgetFieldMeta.displayedKey && data?.[widgetFieldMeta.displayedKey]}
                />
            )
            break
        case FieldType.hint:
            resultField = (
                <ReadOnlyField {...commonProps} className={cn(className, readOnlyFieldStyles.hint)}>
                    {value}
                </ReadOnlyField>
            )
            break
        case FieldType.radio:
            resultField = (
                <RadioButton
                    {...commonProps}
                    value={value as any}
                    values={rowFieldMeta?.values || emptyFieldMeta}
                    onChange={handleChange}
                />
            )
            break
        default:
            resultField = readOnly ? (
                <ReadOnlyField {...commonProps}>{value}</ReadOnlyField>
            ) : (
                <InteractiveInput
                    suffixClassName={suffixClassName}
                    suffix={handleDrilldown && <Icon type="link" />}
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
    if (metaError && showErrorPopup) {
        return (
            <Tooltip
                placement={tooltipPlacement}
                overlayClassName={styles.error}
                title={t(metaError)}
                getPopupContainer={trigger => trigger.parentElement as HTMLElement}
            >
                <div onFocusCapture={updateActiveBc}>
                    <Form.Item validateStatus="error">{resultField}</Form.Item>
                </div>
            </Tooltip>
        )
    }
    return (
        <CustomizationContext.Consumer>
            {context => {
                const customFields = context.customFields
                if (customFields?.[widgetFieldMeta.type] || customFields?.[widgetFieldMeta.key]) {
                    const CustomComponent = customFields?.[widgetFieldMeta.type] || customFields?.[widgetFieldMeta.key]
                    return (
                        <div onFocusCapture={updateActiveBc}>
                            <CustomComponent
                                {...commonProps}
                                customProps={customProps}
                                value={value}
                                onBlur={handleInputBlur}
                                onChange={handleChange}
                            />
                        </div>
                    )
                }
                return <div onFocusCapture={updateActiveBc}>{resultField}</div>
            }}
        </CustomizationContext.Consumer>
    )
}

function mapStateToProps(state: RootState, ownProps: FieldOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const rowMeta = bcUrl ? state.view.rowMeta[ownProps.bcName]?.[bcUrl] : undefined
    const rowFieldMeta = rowMeta?.fields.find(field => field.key === ownProps.widgetFieldMeta.key) as interfaces.RowMetaField
    const missing =
        state.view.pendingValidationFailsFormat === interfaces.PendingValidationFailsFormat.target
            ? (state.view.pendingValidationFails as interfaces.PendingValidationFails)?.[ownProps.bcName]?.[ownProps.cursor]?.[
                  ownProps.widgetFieldMeta.key
              ]
            : (state.view.pendingValidationFails?.[ownProps.widgetFieldMeta.key] as string)
    const metaError = (missing as string) || (rowMeta?.errors?.[ownProps.widgetFieldMeta.key] as string)
    const pendingValue = state.view.pendingDataChanges[ownProps.bcName]?.[ownProps.cursor]?.[ownProps.widgetFieldMeta.key]
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const showErrorPopup = widget?.type !== interfaces.WidgetTypes.Form && !ownProps.disableHoverError
    return {
        activeBc: state.screen.bo.activeBcName,
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
        },
        changeActiveBc: (bcName: string) => {
            dispatch(actions.changeActiveBc({ bcName }))
        }
    }
}
Field.displayName = 'Field'

/**
 * @category Components
 */
const ConnectedField = connect(mapStateToProps, mapDispatchToProps)(Field)

export default ConnectedField
