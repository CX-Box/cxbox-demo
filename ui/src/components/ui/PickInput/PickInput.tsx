import React from 'react'
import { Input, Icon } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './PickInput.less'
import cn from 'classnames'

export interface PickInputProps {
    disabled?: boolean
    value?: string
    onClick?: () => void
    onClear?: () => void
    className?: string
    placeholder?: string
    loading?: boolean
}

const PickInput: React.FunctionComponent<PickInputProps> = ({ disabled, value, placeholder, className, loading, onClick, onClear }) => {
    const handleClick = React.useCallback(() => {
        if (!disabled && onClick) {
            onClick()
        }
    }, [disabled, onClick])

    const { t } = useTranslation()

    const clearButton =
        onClear && !disabled && value ? <Icon data-test-field-picklist-clear={true} type="close-circle" onClick={onClear} /> : null

    return (
        <Input
            disabled={disabled}
            readOnly
            placeholder={placeholder ?? t('Select value')}
            value={value || ''}
            suffix={clearButton}
            className={cn(styles.root, className)}
            addonAfter={
                loading ? (
                    <Icon type="loading" spin />
                ) : (
                    <Icon
                        data-test-field-picklist-popup={true}
                        className={disabled ? styles.disabledButton : undefined}
                        type="folder"
                        onClick={!disabled ? handleClick : undefined}
                    />
                )
            }
        />
    )
}

const MemoizedPickInput = React.memo(PickInput)

export default MemoizedPickInput
