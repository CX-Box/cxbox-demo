import React from 'react'
import { Input, Popover, Button } from 'antd'
import InputDefaultClass, { TextAreaProps as AntdTextAreaProps } from 'antd/lib/input/TextArea'
import styles from './TextArea.less'
import { BaseFieldProps } from '@teslerComponents/Field/Field'
import ReadOnlyField from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField'

type AdditionalAntdTextAreaProps = Partial<Omit<AntdTextAreaProps, 'onChange'>>

export interface TextAreaProps extends BaseFieldProps, AdditionalAntdTextAreaProps {
    defaultValue?: string | null
    maxInput?: number
    onChange?: (value: string) => void
    popover?: boolean
    style?: React.CSSProperties
    minRows?: number
    maxRows?: number
}

/**
 *
 * @param props
 * @category Components
 */
export const TextArea: React.FunctionComponent<TextAreaProps> = ({
    defaultValue,
    maxInput,
    onChange,
    popover,
    disabled,
    readOnly,
    style,
    minRows = 5,
    maxRows = 10,
    className,
    backgroundColor,
    widgetName,
    meta,
    onDrillDown,
    ...rest
}) => {
    const inputRef = React.useRef<Input>(null)
    const textAreaRef = React.useRef<InputDefaultClass>(null)

    const [popoverVisible, setPopoverVisible] = React.useState<boolean>(false)

    const popoverTextAreaBlurHandler = React.useCallback(
        (event: React.FormEvent<HTMLTextAreaElement>) => {
            onChange(event.currentTarget.value)
        },
        [onChange]
    )

    const popoverHideHandler = React.useCallback(() => {
        setPopoverVisible(false)
    }, [])

    const popoverVisibleChangeHandler = React.useCallback((value: boolean) => {
        setPopoverVisible(value)
    }, [])

    const onTextAreaShowed = React.useCallback(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus()
            // Access to private-field, for fixing IE11 bug:
            // While first opening cursor should take place at the end of text, but it appears at the start
            // TODO: find out bug solution without refusing of animation
            if (defaultValue) {
                const textArea = (textAreaRef.current as any).textAreaRef as HTMLTextAreaElement
                textArea.setSelectionRange(defaultValue.length, defaultValue.length)
            }
        }
    }, [defaultValue])

    React.useEffect(() => {
        textAreaRef.current?.setValue(defaultValue ?? '')
    }, [defaultValue])
    const autosize = React.useMemo(() => {
        return { minRows, maxRows }
    }, [minRows, maxRows])

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {defaultValue}
            </ReadOnlyField>
        )
    }

    if (popover) {
        const rcTooltipProps = { afterVisibleChange: onTextAreaShowed }
        return (
            <Popover
                {...rcTooltipProps}
                placement="right"
                title={''}
                overlayClassName={styles.popoverCard}
                content={
                    <div className={styles.popoverCardInnerWrapper}>
                        <Input.TextArea
                            ref={textAreaRef}
                            defaultValue={defaultValue}
                            rows={4}
                            onBlur={popoverTextAreaBlurHandler}
                            disabled={disabled}
                            maxLength={maxInput}
                            {...rest}
                        />
                        <Button className={styles.popoverOkBtn} icon="check" onClick={popoverHideHandler} />
                    </div>
                }
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={popoverVisibleChangeHandler}
            >
                <Input readOnly={true} value={defaultValue} style={style} className={styles.pointer} ref={inputRef} />
            </Popover>
        )
    } else {
        return (
            <Input.TextArea
                ref={textAreaRef}
                defaultValue={defaultValue}
                autoSize={autosize}
                disabled={disabled}
                onBlur={popoverTextAreaBlurHandler}
                style={style}
                className={className}
                maxLength={maxInput}
                {...rest}
            />
        )
    }
}

/**
 * @category Components
 */
const MemoizedTextArea = React.memo(TextArea)

export default MemoizedTextArea
