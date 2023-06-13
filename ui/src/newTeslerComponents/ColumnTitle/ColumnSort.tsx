import React from 'react'
import { Icon } from 'antd'
import cn from 'classnames'
import styles from './ColumnSort.less'
import { useSorter } from '@cxbox-ui/core'
import { FrownOutlined } from '@ant-design/icons'

export interface ColumnSortProps {
    className?: string
    widgetName: string
    fieldKey: string
}

export const ColumnSort = ({ widgetName, className, fieldKey }: ColumnSortProps) => {
    const { hideSort, toggleSort, sorter } = useSorter({ widgetName, fieldKey })

    if (hideSort) {
        return null
    }

    const icon = sorter?.direction === 'asc' ? 'caret-up' : 'caret-down'

    return <FrownOutlined />
}

export default React.memo(ColumnSort)
