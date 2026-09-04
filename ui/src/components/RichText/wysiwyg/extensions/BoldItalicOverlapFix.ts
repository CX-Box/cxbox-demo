/**
 * BoldItalicOverlapFix — keep a bold ∩ italic overlap parseable by separating the colliding `*` runs.
 *
 * Bold (`**`) and italic (`*`) share the `*` delimiter. When they overlap in a staircase, the point
 * where one ends while the other continues produces a run of 4+ stars (`****` / `*****`) — a close
 * (`***`) immediately followed by a reopen (`*` or `**`). Markdown reads that as one delimiter run and
 * can't match it, so both marks are lost on read-back (README_RICHTEXT.md, scenario 16).
 *
 * The two can't be nested in markdown, but we can make it round-trip by inserting a separator between
 * the closing and the reopening run: `…gh****ij…` → `…gh***<sep>*ij…`. That splits the run into a valid
 * `***` close and a `*`/`**` reopen (the reopen already precedes a letter, so it is left-flanking), and
 * the text parses as bold(+italic) followed by a separate italic span. The separator is a zero-width
 * space by default, so nothing visible is added; the alternative is losing the formatting entirely.
 *
 * Runs inside inline code / fenced code blocks are left untouched, so a literal `****` in code is not
 * rewritten. Wraps the shared `MarkdownManager.serialize` (no public Tiptap hook; feature-detected —
 * logs a console error and leaves output unchanged if the internal method is renamed after an upgrade).
 */
import { Extension, JSONContent } from '@tiptap/core'

// Character inserted between the two colliding `*` runs. Its only job is to break the ambiguous 4+
// star run into a separate close (`***`) and reopen — the reopened delimiter is already flanking-valid
// (it precedes a letter). A zero-width space (U+200B) does that invisibly, so no visible gap appears;
// change here to tune (e.g. a plain ' ' if a visible space is preferred).
export const STAR_COLLISION_SEPARATOR = '\u200B'

// Split a run of 4+ `*` (close `***` + reopen `*`/`**`) with the separator, but never inside code.
const separateStarCollisions = (markdown: string): string =>
    markdown.replace(/```[\s\S]*?```|`[^`\n]*`|\*{4,}/g, (match, offset, source) => {
        if (!match.startsWith('*')) {
            return match
        }

        // Count preceding backslashes.
        let slashCount = 0
        for (let i = offset - 1; i >= 0 && source[i] === '\\'; i--) {
            slashCount++
        }

        // Odd number of '\' means the first '*' is escaped.
        if (slashCount % 2 === 1) {
            return match
        }

        return `***${STAR_COLLISION_SEPARATOR}${match.slice(3)}`
    })

export const BoldItalicOverlapFix = Extension.create({
    name: 'boldItalicOverlapFix',

    onCreate() {
        const manager = this.editor.markdown as unknown as {
            serialize?: (doc: JSONContent) => string
            boldItalicOverlapFixPatched?: boolean
        }
        if (!manager || manager.boldItalicOverlapFixPatched) {
            return
        }
        if (typeof manager.serialize !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[RichText] BoldItalicOverlapFix is disabled: @tiptap/markdown no longer exposes ' +
                    '"serialize" (renamed or removed in an upgrade). Overlapping bold + italic may serialise to ' +
                    'an ambiguous `****` and lose formatting — see the bold∩italic scenario in README_RICHTEXT.md.'
            )
            return
        }
        const serialize = manager.serialize.bind(manager)
        manager.serialize = doc => separateStarCollisions(serialize(doc))
        manager.boldItalicOverlapFixPatched = true
    }
})
