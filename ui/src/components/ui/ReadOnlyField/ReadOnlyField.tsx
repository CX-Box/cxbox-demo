import React from 'react'
import styles from './ReadOnlyField.less'
import cn from 'classnames'
import { ActionLink, SearchHighlight } from '@cxboxComponents'
import { useWidgetHighlightFilter } from '@hooks/useWidgetFilter'
import { escapedSrc } from '@utils/strings'
import { interfaces } from '@cxbox-ui/core'

export interface ReadOnlyFieldProps {
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    cursor?: string
    meta?: interfaces.WidgetFieldBase
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
    const filter = useWidgetHighlightFilter(props.widgetName as string, props.meta?.key as string)
    const displayedValue = filter ? (
        <SearchHighlight
            source={(props.children || '').toString()}
            search={escapedSrc(filter?.value?.toString() as string)}
            match={formatString => <b>{formatString}</b>}
        />
    ) : (
        props.children
    )
    return (
        <span
            className={cn(styles.readOnlyField, { [styles.coloredField]: props.backgroundColor }, props.className)}
            style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : undefined}
        >
            {props.onDrillDown ? <ActionLink onClick={props.onDrillDown}>{displayedValue}</ActionLink> : displayedValue}
        </span>
    )
}

export default React.memo(ReadOnlyField)
