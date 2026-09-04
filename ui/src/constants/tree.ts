import type { TreeExpandedStateAfterFilter, TreeSearchModes } from '@interfaces/widget'
import { Lookup } from '@utils/Lookup'

export const TREE_SEARCH_MODES = Lookup.create(['hide', 'collapse'])
export const TREE_EXPANDED_STATE_AFTER_FILTERS = Lookup.create(['merge', 'restore'])

export const DEFAULT_ON_FILTER_APPLY_NEST_LEVEL = 0
export const DEFAULT_PATH_RESTORE_NEST_LEVEL = 3
export const TREE_SHOW_MORE_AUTO_FETCH_ENABLED = true
export const TREE_SHOW_MORE_AUTO_FETCH_MAX_REQUESTS = Infinity

export const DEFAULT_SEARCH_MODE = TREE_SEARCH_MODES.collapse

export const normalizeTreeSearchModes = (searchModes?: string[]): TreeSearchModes[] => {
    const normalizedModes = [...new Set((searchModes ?? []).filter(mode => Lookup.has(TREE_SEARCH_MODES, mode)))] as TreeSearchModes[]

    return normalizedModes.length ? normalizedModes : [DEFAULT_SEARCH_MODE]
}

export const DEFAULT_EXPANDED_STATE_AFTER_FILTER: TreeExpandedStateAfterFilter = TREE_EXPANDED_STATE_AFTER_FILTERS.merge
export const TEXT_SEPARATOR_FOR_NEST_LEVEL: string | null = 'Nesting level over {{limit}}'
export const TREE_SHOW_MORE_PADDING_TOP: number = 0
