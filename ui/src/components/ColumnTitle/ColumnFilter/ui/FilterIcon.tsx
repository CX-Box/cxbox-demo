import React from 'react'
import styles from '../ColumnFilter.less'
import cn from 'classnames'
import { ReactComponent as FilterIconSvg } from '../../filter-solid.svg'

export interface ColumnFilterProps {
    className?: string
    active: boolean
}

export const FilterIcon: React.FC<ColumnFilterProps> = ({ className, active, ...rest }) => {
    return (
        <div
            className={cn(className, styles.icon, {
                [styles.active]: active
            })}
            data-test-widget-list-header-column-filter={true}
            {...rest}
        >
            <FilterIconSvg />
        </div>
    )
}
