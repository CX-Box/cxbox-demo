import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Form, Input, Tooltip } from 'antd'
import { Store } from '@interfaces/store'
import DatePickerField from '@teslerComponents/ui/DatePickerField/DatePickerField'
import NumberInput from '@teslerComponents/ui/NumberInput/NumberInput'
import { NumberTypes } from '@teslerComponents/ui/NumberInput/formaters'
import TextArea from '@teslerComponents/ui/TextArea/TextArea'
import Dictionary from '@teslerComponents/ui/Dictionary/Dictionary'
import MultivalueField from '@teslerComponents/Multivalue/MultivalueField'
import MultiField from '@teslerComponents/ui/MultiField/MultiField'
import ReadOnlyField from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField'
import PickListField from '@teslerComponents/PickListField/PickListField'
import InlinePickList from '@teslerComponents/InlinePickList/InlinePickList'
import FileUpload from '@teslerComponents/FileUpload/FileUpload'
import MultivalueHover from '@teslerComponents/ui/Multivalue/MultivalueHover'
import cn from 'classnames'
import readOnlyFieldStyles from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField.less'
import CheckboxPicker from '@teslerComponents/ui/CheckboxPicker/CheckboxPicker'
import RadioButton from '@teslerComponents/ui/RadioButton/RadioButton'
import styles from './Field.less'
import { CustomizationContext } from '@teslerComponents/View/View'
import { InteractiveInput } from '@teslerComponents/ui/InteractiveInput/InteractiveInput'
import HistoryField from '@teslerComponents/ui/HistoryField/HistoryField'
import { TooltipPlacement } from 'antd/es/tooltip'
import { WidgetField, WidgetFieldBase, WidgetTypes } from '@cxbox-ui/core'
import { DataItem, MultivalueSingleValue, PendingDataItem } from '@cxbox-ui/core'
import { DataValue } from '@cxbox-ui/schema'
import { RowMetaField } from '@cxbox-ui/core'
import { FieldType, PendingValidationFails, PendingValidationFailsFormat } from '@cxbox-ui/core'
import { buildBcUrl, useDrillDownUrl } from '@cxbox-ui/core'
import { $do } from '@actions/types'
import { FrownOutlined } from '@ant-design/icons'

interface FieldOwnProps {
    widgetFieldMeta: WidgetField
    widgetName: string
    bcName: string
    cursor: string
    data?: DataItem
    className?: string
    suffixClassName?: string
    readonly?: boolean
    disableDrillDown?: boolean
    forceFocus?: boolean
    forcedValue?: DataValue
    historyMode?: boolean
    tooltipPlacement?: TooltipPlacement
    customProps?: Record<string, any>
    disableHoverError?: boolean
}

interface FieldProps extends FieldOwnProps {
    data: DataItem
    pendingValue: DataValue
    rowFieldMeta: RowMetaField
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
    meta?: WidgetFieldBase
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
    dataItem: PendingDataItem
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
    const [localValue, setLocalValue] = React.useState(null)
    let resultField: React.ReactChild = null
    const drillDownUrl = useDrillDownUrl(bcName, widgetFieldMeta, cursor)

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
        return !disableDrillDown && drillDownUrl
            ? () => {
                  onDrillDown(widgetName, data?.id, bcName, widgetFieldMeta.key)
              }
            : null
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
        metaError,
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

    switch (widgetFieldMeta.type) {
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.dateTimeWithSeconds:
            resultField = (
                <DatePickerField
                    {...commonProps}
                    onChange={handleChange}
                    value={(value || '').toString()}
                    showTime={widgetFieldMeta.type === FieldType.dateTime}
                    showSeconds={widgetFieldMeta.type === FieldType.dateTimeWithSeconds}
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
                    values={rowFieldMeta ? rowFieldMeta.values : []}
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
                    defaultValue={Array.isArray(value) && value.length > 0 ? (value as MultivalueSingleValue[]) : emptyMultivalue}
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
                <InteractiveInput suffix={handleDrilldown && <FrownOutlined />} onSuffixClick={handleDrilldown}>
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
                <InteractiveInput suffix={handleDrilldown && <FrownOutlined />} onSuffixClick={handleDrilldown}>
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
                    fieldLabel={widgetFieldMeta.label}
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
                    fieldName={widgetFieldMeta.key}
                    bcName={bcName}
                    cursor={cursor}
                    fieldDataItem={data}
                    fieldValue={value as string}
                    fileIdKey={widgetFieldMeta.fileIdKey}
                    fileSource={widgetFieldMeta.fileSource}
                    snapshotKey={widgetFieldMeta.snapshotKey}
                    snapshotFileIdKey={widgetFieldMeta.snapshotFileIdKey}
                />
            )
            break
        case FieldType.multivalueHover:
            resultField = (
                <MultivalueHover
                    {...commonProps}
                    data={(value || emptyMultivalue) as MultivalueSingleValue[]}
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
                    suffix={handleDrilldown && <FrownOutlined />}
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
                title={metaError}
                getPopupContainer={trigger => trigger.parentElement}
            >
                <div>
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
                        <CustomComponent
                            {...commonProps}
                            customProps={customProps}
                            value={value}
                            onBlur={handleInputBlur}
                            onChange={handleChange}
                        />
                    )
                }
                return resultField
            }}
        </CustomizationContext.Consumer>
    )
}

function mapStateToProps(store: Store, ownProps: FieldOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const rowMeta = bcUrl && store.view.rowMeta[ownProps.bcName]?.[bcUrl]
    const rowFieldMeta = rowMeta?.fields.find(field => field.key === ownProps.widgetFieldMeta.key)
    const missing =
        store.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            ? (store.view.pendingValidationFails as PendingValidationFails)?.[ownProps.bcName]?.[ownProps.cursor]?.[
                  ownProps.widgetFieldMeta.key
              ]
            : store.view.pendingValidationFails?.[ownProps.widgetFieldMeta.key]
    const metaError = missing || rowMeta?.errors?.[ownProps.widgetFieldMeta.key]
    const pendingValue = store.view.pendingDataChanges[ownProps.bcName]?.[ownProps.cursor]?.[ownProps.widgetFieldMeta.key]
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const showErrorPopup = widget?.type !== WidgetTypes.Form && !ownProps.disableHoverError
    return {
        data: ownProps.data || store.data[ownProps.bcName]?.find(item => item.id === ownProps.cursor),
        pendingValue,
        rowFieldMeta,
        metaError,
        showErrorPopup
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            return dispatch($do.changeDataItem(payload))
        },
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch($do.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}
Field.displayName = 'Field'

/**
 * @category Components
 */
const ConnectedField = connect(mapStateToProps, mapDispatchToProps)(Field)

export default ConnectedField
