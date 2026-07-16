/**
 * Colorify: inline text-color mark, persisted in YFM-compatible markdown as `{color}(text)`.
 *
 * By priority, color wraps emphasis marks but nests inside links — colored bold `{color}(**x**)`,
 * colored link `[{color}(label)](url)` — matching gravity-ui / Yandex-Wiki.
 *
 * Parens inside a span are backslash-escaped so an inner `)` can't close it early. Tiptap's
 * serializer escapes markdown syntax but not parens and has no per-mark hook, so `onCreate` extends
 * its text escaper to also escape `(` `)` in colorify text (like gravity-ui's `escapeCharacters`);
 * the tokenizer reads back to the first unescaped `)` and Tiptap (>=3.25) decodes the escapes.
 */
import { Mark, mergeAttributes, MarkdownToken, MarkdownParseHelpers, JSONContent, MarkdownRendererHelpers } from '@tiptap/core'

export interface ColorifyOptions {
    HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        colorify: {
            setColorify: (color: string) => ReturnType
            unsetColorify: () => ReturnType
            toggleColorify: (color: string) => ReturnType
        }
    }
}

export const Colorify = Mark.create<ColorifyOptions>({
    name: 'colorify',
    // Between emphasis marks (default 100) and link (1000): color wraps bold/italic/underline/strike
    // (`{color}(++x++)`) but nests inside links (`[{color}(label)](url)`) — matches gravity-ui / Yandex.
    priority: 500,
    excludes: 'colorify',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'colorify'
            }
        }
    },

    // Tiptap's markdown serializer escapes ``\`*_[]~`` in text but not parentheses, and exposes no
    // per-mark escape hook. Extend its text escaper to also backslash-escape `(` `)` inside colorify
    // spans (like gravity-ui's scoped `escapeCharacters`) so an inner paren can't close the span.
    // Runs after the built-in escaping, so the added backslash isn't itself escaped; the tokenizer
    // decodes it on read.
    onCreate() {
        const manager = this.editor.markdown as unknown as {
            encodeTextForMarkdown?: (text: string, node: JSONContent, parent?: JSONContent) => string
            colorifyEscapePatched?: boolean
        }
        if (!manager || manager.colorifyEscapePatched) {
            return
        }
        if (typeof manager.encodeTextForMarkdown !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[RichText] Colorify paren-escaping is disabled: @tiptap/markdown no longer exposes ' +
                    '"encodeTextForMarkdown" (renamed or removed in an upgrade). Parentheses inside a coloured ' +
                    'span will no longer be escaped — see the colour + parentheses scenario in README_RICHTEXT.md.'
            )
            return
        }
        const encode = manager.encodeTextForMarkdown.bind(manager)
        manager.encodeTextForMarkdown = (text, node, parent) => {
            const encoded = encode(text, node, parent)
            const colorified = (node?.marks || []).some(mark => (typeof mark === 'string' ? mark : mark.type) === 'colorify')
            return colorified ? encoded.replace(/[()]/g, '\\$&') : encoded
        }
        manager.colorifyEscapePatched = true
    },

    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: element => {
                    const match = element.className.match(/colorify--([a-z]+)/)
                    return match ? match[1] : null
                },
                renderHTML: attributes => {
                    if (!attributes.color) {
                        return {}
                    }
                    return {
                        class: `colorify--${attributes.color}`
                    }
                }
            }
        }
    },

    parseHTML() {
        return [{ tag: 'span[class*="colorify--"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addCommands() {
        return {
            setColorify:
                color =>
                ({ commands }) =>
                    commands.setMark(this.name, { color }),
            unsetColorify:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
            toggleColorify:
                color =>
                ({ commands }) =>
                    commands.toggleMark(this.name, { color })
        }
    },

    markdownTokenizer: {
        name: 'colorify',
        level: 'inline',
        start(src: string) {
            return src.indexOf('{')
        },
        tokenize(src, tokens, lexer) {
            // `(?:\\.|[^\\)])*` skips backslash-escaped chars and stops at the first unescaped `)`.
            // Every paren inside a color span is escaped on write (see onCreate), so that `)` is the
            // real end of the span.
            const match = src.match(/^\{([a-z]+)\}\(((?:\\.|[^\\)])*)\)/)
            if (!match) {
                return undefined
            }
            return {
                type: 'colorify',
                raw: match[0],
                color: match[1],
                text: match[2],
                tokens: lexer.inlineTokens(match[2])
            }
        }
    },

    parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers) {
        const color = token.color

        return helpers.applyMark('colorify', helpers.parseInline(token.tokens || []), { color })
    },

    renderMarkdown(node: JSONContent, helpers: MarkdownRendererHelpers) {
        const color = node.attrs?.color
        const content = helpers.renderChildren(node.content || [])
        return `{${color}}(${content})`
    }
})
