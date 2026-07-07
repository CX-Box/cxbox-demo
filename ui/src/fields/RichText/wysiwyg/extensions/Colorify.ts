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
    priority: 2000, // colorify will be inside other marks
    excludes: 'colorify',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'colorify'
            }
        }
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
            const match = src.match(/^\{([a-z]+)\}\(([^)]*)\)/)
            if (match) {
                return {
                    type: 'colorify',
                    raw: match[0],
                    color: match[1],
                    text: match[2],
                    tokens: lexer.inlineTokens(match[2])
                }
            }
            return undefined
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
