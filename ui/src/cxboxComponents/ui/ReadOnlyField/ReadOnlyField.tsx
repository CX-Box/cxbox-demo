import React from 'react'
import cn from 'classnames'
import { SearchHighlight } from '@cxboxComponents'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { useWidgetHighlightFilter } from '@hooks/useWidgetFilter'
import { interfaces, utils } from '@cxbox-ui/core'
import styles from './ReadOnlyField.less'

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
    const filter = useWidgetHighlightFilter(props.widgetName ?? '', props.meta?.key ?? '')
    const displayedValue = filter ? (
        <SearchHighlight
            source={(props.children || '').toString()}
            search={utils.escapedSrc(filter.value?.toString() as string)}
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
            {props.onDrillDown ? (
                <DrillDown
                    displayedValue={displayedValue}
                    meta={props.meta}
                    widgetName={props.widgetName}
                    cursor={props.cursor}
                    onDrillDown={props.onDrillDown}
                />
            ) : (
                displayedValue
            )}
        </span>
    )
}

/**
 * @category Components
 */
const MemoizedReadOnlyField = React.memo(ReadOnlyField)

export default MemoizedReadOnlyField
