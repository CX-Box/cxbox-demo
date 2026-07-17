import { TreeExpandedStateAfterFilter } from '@interfaces/widget'
import { Lookup } from '@utils/Lookup'

export const TREE_SEARCH_MODES = Lookup.create(['highlight', 'hide', 'collapse'])
export const TREE_EXPANDED_STATE_AFTER_FILTERS = Lookup.create(['merge', 'restore'])

export const TREE_PATH_RESTORE_MAX_REQUESTS_BEFORE_FILTRATION = 0
export const TREE_PATH_RESTORE_MAX_REQUESTS_AFTER_FILTRATION = 3

export const DEFAULT_SEARCH_MODE = TREE_SEARCH_MODES.highlight
export const DEFAULT_EXPANDED_STATE_AFTER_FILTER: TreeExpandedStateAfterFilter = TREE_EXPANDED_STATE_AFTER_FILTERS.merge

export const TREE_SHOW_MORE_PADDING_TOP: number = 0
