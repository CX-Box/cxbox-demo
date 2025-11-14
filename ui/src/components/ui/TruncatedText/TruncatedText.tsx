import React, { useMemo } from 'react'
import { Tooltip } from 'antd'
// TODO Check all cases
/**
 * Specifies the display mode for long text.
 * - 'wrap': (default) The text is moved to the next line, preserving the integrity of the words.
 * - 'truncate': Text is truncated with ellipsis, full text is available in tooltip.
 * - 'break-all': A forced line break occurs anywhere to avoid going beyond the container.
 */
export type TextOverflowMode = 'wrap' | 'truncate' | 'break-all'

interface TruncatedTextProps {
    children: React.ReactNode
    mode?: TextOverflowMode
    className?: string
    style?: React.CSSProperties
    inline?: boolean
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ inline, children, mode = 'wrap', className, style }) => {
    const Component = inline ? 'span' : 'div'

    const memoizedStyle = useMemo(() => {
        const baseStyle: React.CSSProperties = { ...style }

        if (mode === 'truncate') {
            baseStyle.whiteSpace = 'nowrap'
            baseStyle.overflow = 'hidden'
            baseStyle.textOverflow = 'ellipsis'

            if (inline) {
                baseStyle.display = 'inline-block'
                baseStyle.maxWidth = '100%'
                baseStyle.verticalAlign = 'bottom'
            }
        } else if (mode === 'break-all') {
            baseStyle.wordBreak = 'break-all'
        } else {
            baseStyle.overflowWrap = 'break-word'
            baseStyle.whiteSpace = 'pre-wrap'
        }

        return baseStyle
    }, [style, mode, inline])

    if (mode === 'truncate') {
        return (
            <Tooltip title={children}>
                <Component className={className} style={memoizedStyle}>
                    {children}
                </Component>
            </Tooltip>
        )
    }

    return (
        <Component className={className} style={memoizedStyle}>
            {children}
        </Component>
    )
}

export default React.memo(TruncatedText)
