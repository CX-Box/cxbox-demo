/**
 * canApplyInlineMark — can the current selection be wrapped in an inline mark and still survive a
 * markdown round-trip?
 *
 * Emphasis-style markup obeys the CommonMark "flanking" rule: a `*`/`**` delimiter is only recognised
 * when it is not wedged between a word character and a punctuation character. So wrapping a selection
 * whose edge touches a parenthesis (e.g. bolding `)def` in `abc)def`) produces `abc**)def**`, which
 * reads back with the `**` as plain text — the mark is silently lost (README_RICHTEXT.md, scenario
 * 17). The toolbar uses this predicate to disable the affected buttons so that state can't be created.
 *
 * The rule implemented here is the public CommonMark spec, written in our own terms:
 *   https://spec.commonmark.org/0.31.2/#left-flanking-delimiter-run
 * The behaviour is intentionally aligned with the Yandex-Wiki editor, which disables the same buttons
 * in the same situation, so formatting stays portable if content is ever moved to / edited there. That
 * editor is prior art we took inspiration from, not code we copied:
 *   https://github.com/gravity-ui/markdown-editor/blob/main/packages/editor/src/utils/marks.ts
 *
 * The caller gates every inline mark except colour (bold, italic, underline, strike, inline code) to
 * match that behaviour, although in our `marked`-based parser only bold and italic actually break —
 * underline (`++`), strike (`~~`) and code round-trip fine on their own.
 *
 * Returns false only when applying the mark would break; an empty selection, or an edge next to
 * whitespace or the block boundary, is always allowed.
 */
import { EditorState } from '@tiptap/pm/state'

// For flanking, a "word" character is anything that is neither whitespace nor Unicode punctuation.
const isPunctuation = (ch: string): boolean => /\p{P}/u.test(ch)
const isWord = (ch: string): boolean => ch.length > 0 && !/\s/u.test(ch) && !isPunctuation(ch)

// A selection edge breaks flanking when the delimiter would land between an inner punctuation
// character and an outer word character (outer = the char just before/after the selection).
const edgeBreaksFlanking = (innerChar: string, outerChar: string): boolean => isPunctuation(innerChar) && isWord(outerChar)

export const canApplyInlineMark = (state: EditorState): boolean => {
    const { from, to, empty } = state.selection
    if (empty) {
        return true
    }
    const selected = state.doc.textBetween(from, to)
    if (!selected) {
        return true
    }

    const chars = [...selected]
    const charBefore = from > 0 ? state.doc.textBetween(from - 1, from) : ''
    const charAfter = to < state.doc.content.size ? state.doc.textBetween(to, to + 1) : ''

    const openingBreaks = edgeBreaksFlanking(chars[0], charBefore)
    const closingBreaks = edgeBreaksFlanking(chars[chars.length - 1], charAfter)

    return !openingBreaks && !closingBreaks
}
