/**
 * HardBreakMarkFix — fixes markdown serialization of inline marks that span a soft line break
 * (Shift+Enter, i.e. a ProseMirror `hardBreak` / `<br>`).
 *
 * WHAT IT FIXES
 * When a mark (bold, italic, underline, strikethrough, color, …) is carried on a `hardBreak` node,
 * Tiptap 3.28's markdown serializer closes the marks in the wrong order — e.g. it emits
 * `{c}(++x)++` instead of `{c}(++x++)` — producing markdown that can no longer be parsed back
 * (the delimiters show up as literal text).
 *
 * HOW
 * Strip marks off `hardBreak` nodes before serialization, so mark-closing takes the correct per-line
 * path and each line serializes as a well-formed span.
 *
 * WHY MARKS ARE THERE, AND WHY STRIPPING IS SAFE
 * A `hardBreak` carries marks because ProseMirror applies a mark to every inline node in the
 * selection (including the `<br>`), keeping the mark one continuous span across the line — which
 * matters for LIVE editing (a single visual span, and the mark continuing when you type next to the
 * break). We do NOT break that: the strip runs only on the throwaway copy that `getMarkdown()` hands
 * to the serializer (a fresh `getJSON()`), never the editor's own document. On a `<br>` the mark is
 * invisible anyway, and markdown is per-line, so nothing is lost in the output.
 *
 * WHAT IT AFFECTS
 * Every inline mark across a soft line break — not only color. This wraps the shared
 * `MarkdownManager.serialize`, so it applies to the whole editor's markdown output. There is no
 * public Tiptap hook for this, so it patches the manager instance (feature-detected: if the internal
 * method is missing after a Tiptap upgrade it logs a clear console error and leaves output unchanged).
 *
 * Add this extension alongside the editor's other extensions (see hooks.ts).
 */
import { Extension, JSONContent } from '@tiptap/core'

const stripHardBreakMarks = (node: JSONContent): JSONContent => {
    if (node.type === 'hardBreak' && node.marks) {
        delete node.marks
    }
    node.content?.forEach(stripHardBreakMarks)
    return node
}

export const HardBreakMarkFix = Extension.create({
    name: 'hardBreakMarkFix',

    onCreate() {
        const manager = this.editor.markdown as unknown as {
            serialize?: (doc: JSONContent) => string
            hardBreakMarkFixPatched?: boolean
        }
        if (!manager || manager.hardBreakMarkFixPatched) {
            return
        }
        if (typeof manager.serialize !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[RichText] HardBreakMarkFix is disabled: @tiptap/markdown no longer exposes "serialize" ' +
                    '(renamed or removed in an upgrade). Marks spanning a Shift+Enter break may serialize in the ' +
                    'wrong order — see the Shift+Enter line-break scenario in README_RICHTEXT.md.'
            )
            return
        }
        const serialize = manager.serialize.bind(manager)
        // getMarkdown() passes a fresh getJSON() copy, so stripping it here never touches the doc.
        manager.serialize = doc => serialize(stripHardBreakMarks(doc))
        manager.hardBreakMarkFixPatched = true
    }
})
