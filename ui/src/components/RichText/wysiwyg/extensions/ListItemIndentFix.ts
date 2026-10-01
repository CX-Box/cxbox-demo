/**
 * ListItemIndentFix — the content nested in a numbered list item is indented by 2 spaces, as the parser expects.
 *
 * WHAT BROKE (before this fix)
 * Tiptap 3.30.6 changed the serializer: content nested in a numbered item is indented to the width of the
 * marker (`1. ` is 3 spaces, `10. ` is 4). The parser of numbered lists was not changed and still removes 2.
 * One space is left in the text on every load, so every save adds one more:
 *
 *     1. Run:                 1. Run:                 1. Run:
 *        ```           ->        ```           ->        ```
 *        mvn install              mvn install              mvn install
 *        ```                     ```                     ```
 *
 * The same happens to the third paragraph of a numbered item and to a paragraph of a list nested in it.
 * It is the library alone, with its default settings; 3.28 wrote 2 spaces and was stable.
 *
 * HOW
 * The list item is serialized as in 3.28: the same marker, the nested content indented by the indentation
 * of the Markdown extension (2 spaces). Values stored by earlier versions keep their spelling.
 *
 * WHEN TO DROP
 * When the Tiptap parser removes the same indent the serializer writes
 * (`contentIndent` in @tiptap/extension-list, ordered-list/utils.ts). The regression suite has lines for it:
 * a code block and three paragraphs in a numbered item.
 */
import { renderNestedMarkdownContent } from '@tiptap/core'
import { getListMarker, ListItem } from '@tiptap/extension-list'

export const ListItemIndentFix = ListItem.extend({
    renderMarkdown: (node, helpers, ctx) =>
        renderNestedMarkdownContent(
            node,
            helpers,
            (context: any) => {
                if (context.parentType !== 'orderedList') {
                    return '- '
                }

                const start = context.meta?.parentAttrs?.start || 1
                const index = start - 1 + (context.index || 0)

                return getListMarker(context.meta?.parentAttrs?.type, index, '. ')
            },
            ctx
        )
})
