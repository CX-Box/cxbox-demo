import React from 'react'
import cn from 'classnames'
import SearchHighlight from '@components/ui/SearchHightlight/SearchHightlight'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { useWidgetHighlightFilter } from '@hooks/useWidgetFilter'
import { WidgetFieldBase } from '@cxbox-ui/core'
import styles from './ReadOnlyField.less'
import { getFieldHighlightSearch } from '@utils/filterMatch'

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
    extraContent?: React.ReactNode
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
    const source = (props.children || '').toString()
    const highlightSearch = getFieldHighlightSearch(source, filter, props.meta?.type)
    const displayedValue = (
        <>
            {highlightSearch ? (
                <SearchHighlight source={source} search={highlightSearch} match={formatString => <b>{formatString}</b>} />
            ) : (
                props.children
            )}

            {props.extraContent}
        </>
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

export default React.memo(ReadOnlyField)
