import React from 'react'
import { Icon, Popover } from 'antd'
import styles from './MultivalueHover.less'
import cn from 'classnames'
import { BaseFieldProps } from '@teslerComponents/Field/Field'
import { MultivalueSingleValue } from '@tesler-ui/core'
import { DataValue } from '@tesler-ui/schema'
import { useWidgetHighlightFilter } from '@tesler-ui/core'
import { escapedSrc } from '@tesler-ui/core'
import { SearchHighlight } from '@teslerComponents'

export interface MultivalueHoverProps extends BaseFieldProps {
    data: MultivalueSingleValue[]
    displayedValue: DataValue
    onDrillDown?: () => void
    className?: string
    backgroundColor?: string
}

/**
 *
 * @param props
 * @category Components
 */
const Multivalue: React.FunctionComponent<MultivalueHoverProps> = props => {
    const filterKey = useWidgetHighlightFilter(props.widgetName, props.meta?.key)?.value?.toString()
    const filterValue = props.data?.find(bcDataItem => filterKey?.split(',')?.includes(bcDataItem.id))?.value.toString()
    const displayedItem =
        props.displayedValue !== undefined && props.displayedValue !== null ? (
            <p
                className={cn(styles.displayedValue, { [styles.coloredField]: props.backgroundColor }, props.className)}
                onClick={props.onDrillDown}
                style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : null}
            >
                {filterValue ? (
                    <SearchHighlight
                        source={(props.displayedValue || '').toString()}
                        search={escapedSrc(filterValue)}
                        match={formatString => <b>{formatString}</b>}
                    />
                ) : (
                    props.displayedValue
                )}
            </p>
        ) : props.onDrillDown ? (
            <Icon className={cn(props.className)} type="left-circle" onClick={props.onDrillDown} />
        ) : null
    const fields = props.data.map((multivalueSingleValue, index) => {
        return (
            <div className={styles.multivalueFieldArea} key={index}>
                {multivalueSingleValue.options?.hint && <div className={styles.multivalueHint}>{multivalueSingleValue.options.hint}</div>}
                <div>{multivalueSingleValue.value}</div>
            </div>
        )
    })
    const content = <div className={styles.multivalueArea}>{fields}</div>
    return (
        <Popover content={content} trigger="hover" placement="topLeft">
            {displayedItem}
        </Popover>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalue = React.memo(Multivalue)

export default MemoizedMultivalue
