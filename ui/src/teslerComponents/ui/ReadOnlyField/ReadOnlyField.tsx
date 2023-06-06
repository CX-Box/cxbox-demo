import React from 'react'
import styles from './ReadOnlyField.less'
import cn from 'classnames'
import { WidgetFieldBase } from '@tesler-ui/core'
import { useWidgetHighlightFilter } from '@tesler-ui/core'
import { escapedSrc } from '@tesler-ui/core'
import ActionLink from '@teslerComponents/ui/ActionLink/ActionLink'
import { SearchHighlight } from '@teslerComponents'

export interface ReadOnlyFieldProps {
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    cursor?: string
    meta?: WidgetFieldBase
    backgroundColor?: string
    className?: string
    onDrillDown?: () => void
    children: React.ReactNode
}

/**
 *
 * @param props
 * @category Components
 */
const ReadOnlyField: React.FunctionComponent<ReadOnlyFieldProps> = props => {
    const filter = useWidgetHighlightFilter(props.widgetName, props.meta.key)
    const displayedValue = filter ? (
        <SearchHighlight
            source={(props.children || '').toString()}
            search={escapedSrc(filter.value.toString())}
            match={formatString => <b>{formatString}</b>}
        />
    ) : (
        props.children
    )
    return (
        <span
            className={cn(styles.readOnlyField, { [styles.coloredField]: props.backgroundColor }, props.className)}
            style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : null}
        >
            {props.onDrillDown ? <ActionLink onClick={props.onDrillDown}>{displayedValue}</ActionLink> : displayedValue}
        </span>
    )
}

/**
 * @category Components
 */
const MemoizedReadOnlyField = React.memo(ReadOnlyField)

export default MemoizedReadOnlyField
