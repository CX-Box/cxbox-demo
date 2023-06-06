import React, { FunctionComponent } from 'react'
import { Icon, Input } from 'antd'
import cn from 'classnames'
import readOnlyFieldStyles from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField.less'
import { TooltipPlacement } from 'antd/es/tooltip'
import { useCustomFields, useFieldHandlers, useStoreState } from './Field.utils'
import { WidgetField, WidgetFieldBase, MultivalueSingleValue, FieldType } from '@tesler-ui/core'
import { deleteUndefinedFromObject, DataItem, DataValue } from '@tesler-ui/core'
import HistoryField from '@teslerComponents/ui/HistoryField/HistoryField'
import InlinePickList from '@teslerComponents/InlinePickList/InlinePickList'
import MultiField from '@teslerComponents/ui/MultiField/MultiField'
import ReadOnlyField from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField'
import FileUpload from '@teslerComponents/FileUpload/FileUpload'
import { NumberTypes } from '@teslerComponents/ui/NumberInput/formaters'
import {
    CheckboxPicker,
    DatePickerField,
    Dictionary,
    MultivalueField,
    MultivalueHover,
    NumberInput,
    PickListField,
    RadioButton,
    TextArea
} from '@teslerComponents'
import { InteractiveInput } from '@teslerComponents/ui/InteractiveInput/InteractiveInput'

interface FieldProps {
    widgetField: WidgetField
    widgetName: string
    bcName: string
    cursor: string
    forcedData?: DataItem
    className?: string
    suffixClassName?: string
    readonly?: boolean
    disableDrillDown?: boolean
    forceFocus?: boolean
    forcedValue?: DataValue
    historyMode?: boolean
    tooltipPlacement?: TooltipPlacement
    customProps?: Record<string, any>
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
    meta?: WidgetFieldBase
    className?: string
    metaError?: string
    disabled?: boolean
    placeholder?: string
    readOnly?: boolean
    backgroundColor?: string
    onDrillDown?: () => void
}

export const emptyMultivalue: MultivalueSingleValue[] = []

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
    widgetField,
    cursor,
    forcedValue,
    forcedData,
    disableDrillDown,
    className,
    readonly: readOnly,
    historyMode,
    forceFocus,
    suffixClassName,
    customProps
}) => {
    const {
        currentBcData: data,
        rowMetaField: rowFieldMeta,
        fieldError: metaError,
        disabled,
        placeholder,
        value,
        backgroundColor: bgColor
    } = useStoreState({
        forcedValue,
        forcedData,
        forcedCursor: cursor,
        widgetName,
        widgetField
    })

    const { customFieldExist, CustomFieldComponent } = useCustomFields(widgetField)

    const { inputProps, handleBlur, handleDrillDown, handleChange } = useFieldHandlers({
        bcName,
        widgetName,
        data,
        disableDrillDown,
        cursor,
        widgetField,
        value
    })

    let resultField: React.ReactChild = null

    const commonProps: BaseFieldProps = {
        cursor,
        widgetName,
        meta: widgetField,
        className: cn(className),
        metaError,
        disabled,
        placeholder,
        readOnly,
        backgroundColor: bgColor,
        onDrillDown: handleDrillDown
    }

    deleteUndefinedFromObject(commonProps)

    const commonInputProps: any = {
        cursor,
        meta: widgetField,
        className,
        disabled,
        placeholder,
        readOnly,
        ...inputProps
    }

    deleteUndefinedFromObject(commonInputProps)

    if (!historyMode && widgetField.snapshotKey && simpleDiffSupportedFieldTypes.includes(widgetField.type)) {
        return <HistoryField fieldMeta={widgetField} data={data} bcName={bcName} cursor={cursor} widgetName={widgetName} />
    }

    switch (widgetField.type) {
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.dateTimeWithSeconds:
            resultField = (
                <DatePickerField
                    {...commonProps}
                    onChange={handleChange}
                    value={(value || '').toString()}
                    showTime={widgetField.type === FieldType.dateTime}
                    showSeconds={widgetField.type === FieldType.dateTimeWithSeconds}
                />
            )
            break
        case FieldType.number:
            resultField = (
                <NumberInput
                    {...commonProps}
                    value={value as number}
                    type={NumberTypes.number}
                    digits={widgetField.digits}
                    nullable={widgetField.nullable}
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
                    digits={widgetField.digits}
                    nullable={widgetField.nullable}
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
                    digits={widgetField.digits}
                    nullable={widgetField.nullable}
                    onChange={handleChange}
                    forceFocus={forceFocus}
                />
            )
            break
        case FieldType.dictionary:
            resultField = (
                <Dictionary
                    {...commonProps}
                    value={value as MultivalueSingleValue[] | string}
                    values={rowFieldMeta ? rowFieldMeta.values : []}
                    fieldName={widgetField.key}
                    onChange={handleChange}
                    multiple={widgetField.multiple}
                />
            )
            break
        case FieldType.text:
            resultField = (
                <TextArea
                    {...commonProps}
                    maxInput={widgetField.maxInput}
                    defaultValue={value as string}
                    onChange={handleChange}
                    className={cn({ [readOnlyFieldStyles.error]: metaError })}
                />
            )
            break
        case FieldType.multifield:
            resultField = (
                <MultiField
                    {...commonProps}
                    fields={widgetField.fields}
                    data={data}
                    bcName={bcName}
                    cursor={cursor}
                    widgetName={widgetName}
                    style={widgetField.style}
                />
            )
            break
        case FieldType.multivalue:
            resultField = (
                <MultivalueField
                    {...commonProps}
                    widgetName={widgetName}
                    defaultValue={Array.isArray(value) && value.length > 0 ? (value as MultivalueSingleValue[]) : emptyMultivalue}
                    widgetFieldMeta={widgetField}
                    bcName={bcName}
                />
            )
            break
        case FieldType.pickList: {
            const pickListField = (
                <PickListField
                    {...commonProps}
                    parentBCName={bcName}
                    bcName={widgetField.popupBcName}
                    cursor={cursor}
                    value={value as string}
                    pickMap={widgetField.pickMap}
                />
            )
            resultField = readOnly ? (
                pickListField
            ) : (
                <InteractiveInput suffix={handleDrillDown && <Icon type="link" />} onSuffixClick={handleDrillDown}>
                    {pickListField}
                </InteractiveInput>
            )
            break
        }
        case FieldType.inlinePickList: {
            const pickListField = (
                <InlinePickList
                    {...commonProps}
                    fieldName={widgetField.key}
                    searchSpec={widgetField.searchSpec}
                    bcName={bcName}
                    popupBcName={widgetField.popupBcName}
                    cursor={cursor}
                    value={value as string}
                    pickMap={widgetField.pickMap}
                />
            )
            resultField = readOnly ? (
                pickListField
            ) : (
                <InteractiveInput suffix={handleDrillDown && <Icon type="link" />} onSuffixClick={handleDrillDown}>
                    {pickListField}
                </InteractiveInput>
            )
            break
        }
        case FieldType.checkbox:
            resultField = (
                <CheckboxPicker
                    {...commonProps}
                    fieldName={widgetField.key}
                    fieldLabel={widgetField.label}
                    value={value}
                    bcName={bcName}
                    cursor={cursor}
                    readonly={readOnly}
                />
            )
            break
        case FieldType.fileUpload:
            resultField = (
                <FileUpload
                    {...commonProps}
                    fieldName={widgetField.key}
                    bcName={bcName}
                    cursor={cursor}
                    fieldDataItem={data}
                    fieldValue={value as string}
                    fileIdKey={widgetField.fileIdKey}
                    fileSource={widgetField.fileSource}
                    snapshotKey={widgetField.snapshotKey}
                    snapshotFileIdKey={widgetField.snapshotFileIdKey}
                />
            )
            break
        case FieldType.multivalueHover:
            resultField = (
                <MultivalueHover
                    {...commonProps}
                    data={(value || emptyMultivalue) as MultivalueSingleValue[]}
                    displayedValue={widgetField.displayedKey && data?.[widgetField.displayedKey]}
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
                    value={value as string}
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
                    suffix={handleDrillDown && <Icon type="link" />}
                    onSuffixClick={handleDrillDown}
                >
                    <Input {...commonInputProps} autoFocus={forceFocus} maxLength={widgetField.maxInput} />
                </InteractiveInput>
            )
    }

    if (customFieldExist) {
        resultField = (
            <CustomFieldComponent {...commonProps} customProps={customProps} value={value} onBlur={handleBlur} onChange={handleChange} />
        )
    }

    return resultField
}

export default React.memo(Field)
