import React, { RefAttributes } from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/es/input'
import { BaseFieldProps } from '@components/Field/Field'
import { fractionsRound, NumberInputFormat, NumberTypes } from './formaters'
import ReadOnlyField from '@components/ui/ReadOnlyField/ReadOnlyField'
import styles from './NumberInput.less'

export interface NumberInputProps extends BaseFieldProps {
    onChange?: (value: number) => void
    value: number
    nullable?: boolean
    digits?: number
    type: NumberTypes
    maxInput?: number
    forceFocus?: boolean
    currency?: string
    onChangeInputValue?: (value: number) => void
}

/**
 *
 * @param props
 * @category Components
 */
const NumberInput: React.FunctionComponent<NumberInputProps> = props => {
    const { type, value, digits, nullable, maxInput, onChange, onChangeInputValue } = props
    const inputRef = React.useRef<Input>(null)

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
            return fractionsRound(Number(normalizeValueFormat(text)), digits as number)
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
                const selectionStart = target.selectionStart as number
                const selectionEnd = target.selectionEnd as number

                const unformatedValue = unformatValue(targetValue)
                setMode('edit')

                target.value = unformatedValue
                const selection = getUnformatedValueSelection(targetValue, selectionStart, selectionEnd)
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

            if (onChangeInputValue) {
                onChangeInputValue(parseEditedValueText(event.currentTarget.value) as number)
            }
        },
        [maxInput, onChangeInputValue, parseEditedValueText]
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

    const extendedProps: InputProps & RefAttributes<Input> = {
        ...props,
        style: {
            backgroundColor: props.backgroundColor || '#fff'
        },
        className: styles.container,
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
                cursor={props.cursor}
                onDrillDown={props.onDrillDown}
            >
                {`${NumberInputFormat[type](props.value, props.digits, props.nullable)}${currency ? ` ${currency}` : ''}`}
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

export default React.memo(NumberInput)
