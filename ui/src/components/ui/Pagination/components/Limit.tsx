import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'

const DEFAULT_PAGE_LIMIT = 5
const AVAILABLE_LIMITS_LIST = [5, 10, 15, 20]

interface LimitProps {
    className: string
    value?: number
    total?: number | string
    options?: number[]
    onChange?: (value: number) => void
}

function Limit({ className, onChange, value = DEFAULT_PAGE_LIMIT, options = AVAILABLE_LIMITS_LIST, total = '???' }: LimitProps) {
    const { t } = useTranslation()

    return (
        <Select value={value} className={className} onSelect={onChange}>
            {options.map(limit => (
                <Select.Option key={limit} value={limit}>
                    {t('limit of', { limit, total })}
                </Select.Option>
            ))}
        </Select>
    )
}

export default React.memo(Limit)
