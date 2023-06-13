import React from 'react'
import { Input, Icon } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './PickInput.less'
import { FrownOutlined } from '@ant-design/icons'

export interface PickInputProps {
    disabled?: boolean
    value?: string
    onClick?: () => void
    onClear?: () => void
    className?: string
    placeholder?: string
    loading?: boolean
}

/**
 *
 * @param props
 * @category Components
 */
const PickInput: React.FunctionComponent<PickInputProps> = ({ disabled, value, placeholder, className, loading, onClick, onClear }) => {
    const handleClick = React.useCallback(() => {
        if (!disabled && onClick) {
            onClick()
        }
    }, [disabled, onClick])

    const { t } = useTranslation()

    const clearButton = onClear && !disabled && value ? <FrownOutlined /> : null

    return (
        <Input
            disabled={disabled}
            readOnly
            placeholder={placeholder ?? t('Select value')}
            value={value || ''}
            suffix={clearButton}
            className={className}
            addonAfter={loading ? <FrownOutlined /> : <FrownOutlined />}
        />
    )
}

/**
 * @category Components
 */
const MemoizedPickInput = React.memo(PickInput)

export default MemoizedPickInput
