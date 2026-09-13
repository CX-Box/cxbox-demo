import { utils } from '@cxbox-ui/core'

export const getSearchHighlightTokens = (source: string, search: string | RegExp) => utils.splitIntoTokens(source, search).filter(Boolean)

export const isSearchHighlightTokenMatched = (token: string, search: string | RegExp) => {
    if (search instanceof RegExp) {
        search.lastIndex = 0
        return search.test(token)
    }

    return token === search
}

export const containsSearchHighlightMatch = (source: string, search: string | RegExp) =>
    getSearchHighlightTokens(source, search).some(token => isSearchHighlightTokenMatched(token, search))
