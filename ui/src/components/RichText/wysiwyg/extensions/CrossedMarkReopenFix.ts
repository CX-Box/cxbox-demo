/**
 * CrossedMarkReopenFix — reopen marks split by an overlap with markdown delimiters, not raw HTML.
 *
 * WHAT BROKE (before this fix)
 * Scenario: type `abcdefghijklmnop`, then underline `abcdefgh`, bold `ghijkl`, strike `klmnop` —
 * three marks in a staircase. Bold sits in the middle and is split by the underline; Tiptap 3.28
 * reopened its second half as raw HTML, and the strike nested in that HTML was lost on the next load:
 *
 *     ++abcdef**gh**++<strong>ij~~kl~~</strong>~~mnop~~     (strike on "kl" turns into literal ~~)
 *
 * WHY DISABLING THE HTML REOPEN FIXES IT
 * The serializer reopens a split mark as HTML only when `getHtmlReopenTags(mark)` returns tags; we
 * make it return nothing, so the mark reopens with its own delimiter instead. The same scenario now
 * serializes as `++abcdef**gh**++**ij~~kl~~**~~mnop~~`, and the strike survives the round-trip.
 *
 * WHY THIS MATTERS MORE FOR US
 * We persist ONLY the markdown and rebuild the document from it on every load — markdown is our source
 * of truth. Editors that keep their own model treat markdown as an export, so a lossy tag there costs
 * nothing; for us the dropped mark is gone for good.
 *
 * WHAT CAN STILL BREAK
 * Only bold ∩ italic overlapping each other: both use `*`, so their boundary needs an ambiguous `****`
 * that no markdown parser (ours or Yandex-Wiki's) reads back. It broke before too, just as HTML.
 * Everything that round-tripped before still does (verified across every mark triple).
 *
 * No public Tiptap hook exists, so we patch the manager instance (feature-detected: if that method is
 * renamed after an upgrade it logs a clear console error and leaves output unchanged).
 */
import { Extension } from '@tiptap/core'

export const CrossedMarkReopenFix = Extension.create({
    name: 'crossedMarkReopenFix',

    onCreate() {
        const manager = this.editor.markdown as unknown as {
            getHtmlReopenTags?: (markType: string) => unknown
            crossedMarkReopenFixPatched?: boolean
        }
        if (!manager || manager.crossedMarkReopenFixPatched) {
            return
        }
        if (typeof manager.getHtmlReopenTags !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[RichText] CrossedMarkReopenFix is disabled: @tiptap/markdown no longer exposes ' +
                    '"getHtmlReopenTags" (renamed or removed in an upgrade). Overlapping marks may fall back to ' +
                    'raw HTML and drop a nested mark — see the staggered-overlap scenario in README_RICHTEXT.md.'
            )
            return
        }
        manager.getHtmlReopenTags = () => undefined
        manager.crossedMarkReopenFixPatched = true
    }
})
