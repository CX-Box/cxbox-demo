import React from 'react'
import cn from 'classnames'
import styles from '../aiExtract.module.css'
import { AiFieldOrigin, AiFieldTone } from '../state'

/**
 * The mark of a field, drawn here and nowhere else. The form, the queue, the card and the frame over the
 * document all render this very component, so the same field cannot look one way in one place and another way
 * in another.
 * <p>
 * The glyphs are our own and not taken from the icon set: a set icon carries its own baseline and its own
 * padding, and inside a circle of sixteen pixels that shows up as a glyph standing a pixel off the centre. Here
 * every path is drawn around the centre of the same square.
 */
const GLYPH: Record<AiFieldOrigin, React.ReactNode> = {
    // a sheet with two lines of text: the value was read out of the document
    document: (
        <>
            <rect x="3.6" y="2.4" width="8.8" height="11.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6 6.2h4M6 9.2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
    ),
    // the field of the form itself: this is what the record held before the run ever happened
    form: (
        <>
            <rect x="2" y="4" width="12" height="8" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5.2 8h3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
    ),
    // a pencil: the person wrote this themselves
    manual: <path d="M3.4 12.6l.8-2.8 5.6-5.6a1.5 1.5 0 0 1 2.1 2.1l-5.6 5.6-2.9.7z" fill="currentColor" />,
    // nothing was found
    none: <path d="M3.8 8h8.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
}

interface AiMarkProps {
    origin: AiFieldOrigin
    /** the tone is the circle; the history of a value shows the glyphs bare, so there the tone is left out */
    tone?: AiFieldTone
    className?: string
    title?: string
    onMouseDown?: (event: React.MouseEvent) => void
    'data-test'?: string
}

function AiMark({ origin, tone, className, ...rest }: AiMarkProps) {
    return (
        <span className={cn(styles.mark, tone ? styles['mark_' + tone] : styles.markBare, className)} {...rest}>
            <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden="true">
                {GLYPH[origin]}
            </svg>
        </span>
    )
}

export default React.memo(AiMark)
