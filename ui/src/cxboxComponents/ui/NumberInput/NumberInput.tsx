import React, { RefAttributes } from 'react'
import { Input, Input as InputRef } from 'antd'
import { fractionsRound, NumberInputFormat, NumberTypes } from '@cxboxComponents/ui/NumberInput/formaters'
import { InputProps } from 'antd/es/input'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'

export interface NumberInputProps extends BaseFieldProps {
    onChange?: (value: number) => void
    value: number
    nullable?: boolean
    digits?: number
    type: NumberTypes
    maxInput?: number
    forceFocus?: boolean
    currency?: string
}

/**
 *
 * @param props
 * @category Components
 */
const NumberInput: React.FunctionComponent<NumberInputProps> = props => {
    const { type, value, digits = 0, nullable, maxInput, onChange } = props
    const inputRef = React.useRef<InputRef>(null)

    const currency = type === NumberTypes.money && props.currency

    const getDisplayedValueText = React.useCallback(
        (newValue?: number): string => {
            return NumberInputFormat[type](newValue !== undefined ? newValue : value, digits, nullable)
        },
        [type, value, digits, nullable]
    )

    const [mode, setMode] = React.useState<'edit' | 'view'>('view')
    const [valueText, setValueText] = React.useState<string>(getDisplayedValueText())

    React.useEffect(() => {
        if (mode === 'view') {
            setValueText(getDisplayedValueText())
        }
    }, [mode, value, getDisplayedValueText])

    /**
     * TODO
     *
     * @param text
     */
    const parseEditedValueText = React.useCallback(
        (text: string) => {
            if (nullable && text === '') {
                return null
            }
            return fractionsRound(Number(normalizeValueFormat(text)), digits)
        },
        [nullable, digits]
    )

    const handleOnBlur = React.useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const newValue = parseEditedValueText(event.currentTarget.value) as number

            if (isNaN(newValue)) {
                // TODO: should show the error instead of clearing
                setMode('view')
                setValueText(getDisplayedValueText())
                return
            }

            if (onChange) {
                setMode('view')
                setValueText(getDisplayedValueText(newValue))
                onChange(newValue)
            }
        },
        [onChange, parseEditedValueText, getDisplayedValueText]
    )

    const handleOnFocus = React.useCallback(() => {
        // Fix cusror resetting to start position on Internet Explorer
        // selectionStart and selectionEnd are always 0 in Chrome during onFocus
        setTimeout(() => {
            if (inputRef.current?.input) {
                const target = inputRef.current.input
                const targetValue = target.value
                const selectionStart = target.selectionStart
                const selectionEnd = target.selectionEnd

                const unformatedValue = unformatValue(targetValue)
                setMode('edit')

                target.value = unformatedValue
                const selection = getUnformatedValueSelection(targetValue, selectionStart as number, selectionEnd as number)
                target.setSelectionRange(selection[0], selection[1])
            }
        }, 0)
    }, [])

    const handleOnChange = React.useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const newValue =
                maxInput && event.currentTarget.value.length > maxInput
                    ? event.currentTarget.value.slice(0, maxInput)
                    : event.currentTarget.value

            setValueText(newValue)
        },
        [maxInput]
    )

    // Filters out incorrect symbols from keyboard
    // !! this won't work if pasted from the buffer
    const onKeyPress = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            const char = String.fromCharCode(event.keyCode || event.charCode)
            if (unformatValue(char) === '' || (props.maxInput && valueText?.length >= props.maxInput)) {
                event.preventDefault()
            }
        },
        [props.maxInput, valueText]
    )

    const extendedProps: InputProps & RefAttributes<InputRef> = {
        ...props,
        style: {
            backgroundColor: props.backgroundColor || '#fff'
        },
        addonAfter: currency,
        onChange: handleOnChange,
        onBlur: handleOnBlur,
        onFocus: handleOnFocus,
        value: valueText,
        type: 'text',
        ref: inputRef,
        onKeyPress: onKeyPress,
        autoFocus: props.forceFocus
    }

    if (props.readOnly) {
        return (
            <ReadOnlyField
                widgetName={props.widgetName}
                meta={props.meta}
                className={props.className}
                backgroundColor={props.backgroundColor}
                onDrillDown={props.onDrillDown}
            >
                {NumberInputFormat.number(props.value, props.digits, props.nullable)} {currency}
            </ReadOnlyField>
        )
    }

    return <Input {...extendedProps} />
}

/**
 * TODO
 *
 * @param text
 */
function normalizeValueFormat(text: string) {
    return text.replace(/[,.]/g, '.').replace(/[\s]/g, '')
}

/**
 * TODO
 *
 * @param text
 */
function unformatValue(text: string) {
    return text.replace(/[^-,.\d]/g, '')
}

/**
 * TODO
 *
 * @param formatedValue
 * @param start
 * @param end
 */
function getUnformatedValueSelection(formatedValue: string, start: number, end: number): [number, number] {
    const selectionStartStart = formatedValue.substr(0, start)
    const selectionEndStart = formatedValue.substr(0, end)

    return [unformatValue(selectionStartStart).length, unformatValue(selectionEndStart).length]
}

/**
 * @category Components
 */
const MemoizedNumberInput = React.memo(NumberInput)

export default MemoizedNumberInput
