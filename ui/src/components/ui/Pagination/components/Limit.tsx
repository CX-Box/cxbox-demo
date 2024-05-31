import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './Limit.less'
import cn from 'classnames'

const DEFAULT_PAGE_LIMIT = 5
const AVAILABLE_LIMITS_LIST = [5, 10, 15, 20]

interface LimitProps {
    className: string
    classNameContainer?: string
    value?: number
    total?: number | string
    options?: number[]
    onChange?: (value: number) => void
    disabled?: boolean
}

function Limit({
    className,
    classNameContainer,
    onChange,
    value = DEFAULT_PAGE_LIMIT,
    options = AVAILABLE_LIMITS_LIST,
    total = '???',
    disabled
}: LimitProps) {
    const { t } = useTranslation()

    return (
        <div className={cn(styles.root, classNameContainer)}>
            <Select value={value} className={className} onSelect={onChange} disabled={disabled}>
                {options.map(limit => (
                    <Select.Option key={limit} value={limit}>
                        {t('limit / page', { limit })}
                    </Select.Option>
                ))}
            </Select>
            {t('of total', { total })}
        </div>
    )
}

export default React.memo(Limit)
