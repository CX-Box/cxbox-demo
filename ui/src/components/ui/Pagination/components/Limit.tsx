import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './Limit.module.less'
import cn from 'classnames'
import { AVAILABLE_LIMITS_LIST, DEFAULT_PAGE_LIMIT } from '@constants/pagination'

interface LimitProps {
    className: string
    classNameContainer?: string
    value?: number
    total?: number | string | null
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
    const hideTotal = total === null

    return (
        <div className={cn(styles.root, classNameContainer)}>
            <Select
                className={className}
                value={value}
                getPopupContainer={trigger => trigger.parentElement as HTMLElement}
                disabled={disabled}
                onSelect={onChange}
            >
                {options.map(limit => (
                    <Select.Option key={limit} value={limit}>
                        {t('limit / page', { limit })}
                    </Select.Option>
                ))}
            </Select>
            {!hideTotal ? t('of total', { total }) : null}
        </div>
    )
}

export default React.memo(Limit)
