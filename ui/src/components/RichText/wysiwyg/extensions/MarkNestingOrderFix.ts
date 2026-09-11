/**
 * MarkNestingOrderFix — open overlapping inline marks in extent order so they nest validly in markdown.
 *
 * WHAT BROKE (before this fix)
 * When several marks start at the same place but end at different points — e.g. underline over a whole
 * span, bold over its first half, strike over its start — the serializer opened them by a fixed
 * priority, which could open a shorter mark (bold) OUTSIDE a longer one (underline). Closing the outer
 * bold while the inner underline is still open is invalid nesting; it produced
 *   `**++~~abc~~defghi**jklmn++`   (bold opened before underline but closing first)
 * and on read-back the `++` right after `**` isn't recognised, so underline is lost entirely.
 *
 * HOW
 * Markdown marks must nest, so the mark that reaches FURTHEST has to be the OUTERMOST. We order the
 * marks opening at each position by how far they extend (the last inline node they cover) — longest
 * last, i.e. outermost. The example then serialises as `++**~~abc~~defghi**jklmn++` (underline outside
 * bold), which round-trips; marks that end soonest fall innermost automatically. Mirror cases (bold the
 * longer one) keep bold outside, so they are unaffected.
 *
 * This mirrors what prosemirror-markdown (the Yandex-Wiki stack) does; @tiptap/markdown 3.28 instead
 * orders by static registration rank, which is wrong whenever the longest-living mark isn't top rank.
 *
 * Tracked upstream as an OPEN Tiptap bug (no fix/PR as of 3.28, the latest):
 *   https://github.com/ueberdosis/tiptap/issues/7376
 * Tiptap fixed sibling overlap cases in 3.16/3.20/3.23; this partial-overlap-with-unequal-ends case is
 * the remaining one. Drop this patch once #7376 ships.
 *
 * Two private methods are patched (no public hook): `renderNodesWithMarkBoundaries` (to capture the
 * inline nodes of the block being serialized) and `getMarksToOpenForSerialization` (to reorder the
 * marks opening at a position). Feature-detected — logs a console error and leaves ordering unchanged
 * if either is renamed after an upgrade.
 */
import { Extension } from '@tiptap/core'

type MarkTypeLike = string | { name: string }
interface InlineNode {
    type?: string
    marks?: { type: MarkTypeLike; attrs?: { color?: string } }[]
}
// A mark the serializer is about to open: `type` plus the source mark carrying its attributes.
interface OpeningMark {
    type: MarkTypeLike
    mark?: { attrs?: { color?: string } }
}

interface MarkdownManager {
    renderNodesWithMarkBoundaries?: (nodes: InlineNode[], ...rest: unknown[]) => string
    getMarksToOpenForSerialization?: (...args: unknown[]) => OpeningMark[]
    markNestingOrderFixPatched?: boolean
}

const nameOf = (type: MarkTypeLike): string => (typeof type === 'string' ? type : type.name)

const sameMark = (a: { type: MarkTypeLike; attrs?: { color?: string } }, b: OpeningMark): boolean =>
    nameOf(a.type) === nameOf(b.type) && (a.attrs?.color ?? '') === (b.mark?.attrs?.color ?? '')

export const MarkNestingOrderFix = Extension.create({
    name: 'markNestingOrderFix',

    onCreate() {
        const manager = this.editor.markdown as unknown as MarkdownManager
        if (!manager || manager.markNestingOrderFixPatched) {
            return
        }

        const render = manager.renderNodesWithMarkBoundaries
        const open = manager.getMarksToOpenForSerialization
        if (typeof render !== 'function' || typeof open !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[RichText] MarkNestingOrderFix is disabled: @tiptap/markdown no longer exposes ' +
                    '"renderNodesWithMarkBoundaries"/"getMarksToOpenForSerialization" (renamed or removed in an ' +
                    'upgrade). Overlapping marks that start together may nest in the wrong order and lose a mark — ' +
                    'see the overlapping-marks scenario in README_RICHTEXT.md.'
            )
            return
        }

        // Inline nodes of the block currently being serialized, captured so `extentEnd` can measure how
        // far each mark reaches. Set on every render call; read synchronously within the same call.
        let inlineNodes: InlineNode[] = []

        manager.renderNodesWithMarkBoundaries = (nodes, ...rest) => {
            inlineNodes = nodes
            return render.call(manager, nodes, ...rest)
        }

        // Index of the last inline node this mark covers — its outer extent.
        const extentEnd = (openingMark: OpeningMark): number => {
            let last = -1
            inlineNodes.forEach((node, index) => {
                if (node.type === 'text' && node.marks?.some(mark => sameMark(mark, openingMark))) {
                    last = index
                }
            })
            return last
        }

        manager.getMarksToOpenForSerialization = (...args) => {
            const marks = open.call(manager, ...args)
            if (marks.length <= 1) {
                return marks
            }
            // Stable sort by extent ascending: the furthest-reaching mark ends up last = outermost.
            return marks
                .map((mark, index) => ({ mark, index }))
                .sort((a, b) => extentEnd(a.mark) - extentEnd(b.mark) || a.index - b.index)
                .map(entry => entry.mark)
        }

        manager.markNestingOrderFixPatched = true
    }
})
