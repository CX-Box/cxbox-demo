import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './Limit.less'

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
        <div className={styles.root}>
            <Select value={value} className={className} onSelect={onChange}>
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
