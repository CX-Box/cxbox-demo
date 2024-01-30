import React from 'react'
import cn from 'classnames'
import { Icon, Input } from 'antd'
import styles from './SearchInput.less'

interface SearchInputProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: string | number
    className?: string
    placeholder?: string
}

const SearchInput: React.FunctionComponent<SearchInputProps> = props => {
    const { onChange, value, className, placeholder = 'Search' } = props
    return (
        <div className={cn(styles.container, className)}>
            <Input value={value} prefix={<Icon type="search" />} placeholder={placeholder} onChange={onChange} maxLength={100} allowClear />
        </div>
    )
}

export default React.memo(SearchInput)
