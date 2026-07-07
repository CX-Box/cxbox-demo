import Strike from '@tiptap/extension-strike'

export const CustomStrike = Strike.extend({
    // The plugin is missing a property, which is why the conversion from md to wysiwyg did not work when disabling gfm in the markdown extension
    markdownTokenizer: {
        name: 'del',
        level: 'inline',
        start(src: string) {
            return src.indexOf('~~')
        },
        tokenize(src, tokens, lexer) {
            const rule = /^~~(?=\S)([\s\S]*?\S)~~/
            const match = rule.exec(src)
            if (match) {
                return {
                    type: 'del',
                    raw: match[0],
                    text: match[1],
                    tokens: lexer.inlineTokens(match[1])
                }
            }
            return undefined
        }
    }
})
