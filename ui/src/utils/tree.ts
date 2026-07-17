import { WidgetMeta } from '@cxbox-ui/core'
import { FIELDS } from '@constants'
import { AppWidgetMeta } from '@interfaces/widget'

export const DEFAULT_TREE_PARENT_FIELD_KEY = FIELDS.TREE.PARENT_ID
export const DEFAULT_TREE_IS_LEAF_FIELD_KEY = 'isLeaf'

export const getTreeFieldKeys = (widget?: WidgetMeta | AppWidgetMeta) => ({
    parentFieldKey: (widget as AppWidgetMeta | undefined)?.options?.tree?.parentFieldKey ?? DEFAULT_TREE_PARENT_FIELD_KEY,
    isLeafFieldKey: (widget as AppWidgetMeta | undefined)?.options?.tree?.isLeafFieldKey ?? DEFAULT_TREE_IS_LEAF_FIELD_KEY
})

export const getTreeNodeParentId = (node: Record<string, any> | undefined, parentFieldKey: string) => node?.[parentFieldKey]

export const getTreeNodeIsLeaf = (node: Record<string, any> | undefined, isLeafFieldKey: string) => node?.[isLeafFieldKey] === true
