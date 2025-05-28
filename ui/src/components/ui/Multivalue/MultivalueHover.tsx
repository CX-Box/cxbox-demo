import React from 'react'
import { Icon, Popover } from 'antd'
import styles from './MultivalueHover.less'
import cn from 'classnames'
import { BaseFieldProps } from '@components/Field/Field'
import SearchHighlight from '@components/ui/SearchHightlight/SearchHightlight'
import { interfaces, utils } from '@cxbox-ui/core'
import { useWidgetHighlightFilter } from '@hooks/useWidgetFilter'

export interface MultivalueHoverProps extends BaseFieldProps {
    data: interfaces.MultivalueSingleValue[]
    displayedValue: interfaces.DataValue
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
    const filterKey = useWidgetHighlightFilter(props.widgetName ?? '', props.meta?.key ?? '')?.value?.toString()
    const filterValue = props.data?.find(bcDataItem => filterKey?.split(',')?.includes(bcDataItem.id))?.value.toString()
    const displayedItem =
        props.displayedValue !== undefined && props.displayedValue !== null ? (
            <p
                className={cn(styles.displayedValue, styles.readOnly, { [styles.coloredField]: props.backgroundColor }, props.className)}
                onClick={props.onDrillDown}
                style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : undefined}
            >
                {filterValue ? (
                    <SearchHighlight
                        source={(props.displayedValue || '').toString()}
                        search={utils.escapedSrc(filterValue)}
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

export default React.memo(Multivalue)
