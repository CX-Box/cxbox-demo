import React from 'react'
import { utils } from '@cxbox-ui/core'

interface SearchHighlightProps {
    source: string
    search: string | RegExp
    match?: (substring: string) => React.ReactNode
    notMatch?: (substring: string) => React.ReactNode
}

/**
 *
 * @param props
 * @category Components
 */
const SearchHighlight: React.FC<SearchHighlightProps> = props => {
    const tokens = utils.splitIntoTokens(props.source, props.search)
    return (
        <>
            {tokens
                .filter(item => !!item)
                .map((item, index) => {
                    const isMatch = props.search instanceof RegExp ? props.search.test(item) : item === props.search
                    if (isMatch) {
                        return <React.Fragment key={index}>{props.match?.(item) || defaultHighlighter(item)}</React.Fragment>
                    }
                    return <React.Fragment key={index}>{props.notMatch?.(item) || item}</React.Fragment>
                })}
        </>
    )
}

/**
 * Default renderer for highlighting search results.
 *
 * Wraps an argument into `<b>` tag.
 *
 * @param value
 */
export const defaultHighlighter = (value: string) => <b>{value}</b>

export default React.memo(SearchHighlight)
