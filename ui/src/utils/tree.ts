import { WidgetMeta } from '@cxbox-ui/core'
import { FIELDS } from '@constants'
import { AppWidgetMeta } from '@interfaces/widget'
import { TREE_ROOT_ID } from '@constants/tree'
import { isDefined } from '@utils/isDefined'

export const DEFAULT_TREE_PARENT_FIELD_KEY = FIELDS.TREE.PARENT_ID
export const DEFAULT_TREE_IS_LEAF_FIELD_KEY = 'isLeaf'

export interface GetAncestorNodeIdsOptions {
    includeRoot?: boolean
}

export interface CollectSubtreeOptions {
    includeSelf?: boolean
}

export const getTreeFieldKeys = (widget?: WidgetMeta | AppWidgetMeta) => ({
    parentFieldKey: (widget as AppWidgetMeta | undefined)?.options?.tree?.parentFieldKey ?? DEFAULT_TREE_PARENT_FIELD_KEY,
    isLeafFieldKey: (widget as AppWidgetMeta | undefined)?.options?.tree?.isLeafFieldKey ?? DEFAULT_TREE_IS_LEAF_FIELD_KEY
})

export const getTreeNodeParentId = (node: Record<string, any> | undefined, parentFieldKey: string) => node?.[parentFieldKey]

export const getTreeNodeIsLeaf = (node: Record<string, any> | undefined, isLeafFieldKey: string) => node?.[isLeafFieldKey] === true

export const normalizeNodeId = (id: unknown): string => (isDefined(id) ? String(id) : TREE_ROOT_ID)

export const extractNodeIds = <T extends { id: unknown }>(items: T[] = [], idKey: string = FIELDS.TECHNICAL.ID): string[] => {
    return items.map(item => String(item[idKey as keyof T]))
}

export const getAncestorNodeIds = (
    nodeId: unknown,
    getNode: (nodeId: string) => Record<string, any> | undefined,
    parentFieldKey: string,
    options?: GetAncestorNodeIdsOptions
): string[] => {
    const ancestorIds: string[] = []
    let currentNodeId = normalizeNodeId(nodeId)

    if (currentNodeId === TREE_ROOT_ID) {
        return ancestorIds
    }

    const visited = new Set<string>([currentNodeId])

    while (currentNodeId !== TREE_ROOT_ID) {
        const node = getNode(currentNodeId)
        if (!node) {
            break
        }

        const rawParentId = getTreeNodeParentId(node, parentFieldKey)
        if (!isDefined(rawParentId)) {
            if (options?.includeRoot) {
                ancestorIds.push(TREE_ROOT_ID)
            }
            break
        }

        const parentId = normalizeNodeId(rawParentId)
        if (parentId === TREE_ROOT_ID) {
            if (options?.includeRoot) {
                ancestorIds.push(TREE_ROOT_ID)
            }
            break
        }

        if (visited.has(parentId)) {
            break
        }

        visited.add(parentId)
        ancestorIds.push(parentId)
        currentNodeId = parentId
    }

    return ancestorIds
}

export const collectSubtreeNodeIds = (
    nodeId: unknown,
    getChildIds: (nodeId: string) => string[] | undefined,
    options?: CollectSubtreeOptions
): Set<string> => {
    const subtreeIds = new Set<string>()
    const normalizedId = normalizeNodeId(nodeId)
    const includeSelf = options?.includeSelf === true
    const queue = (includeSelf ? [normalizedId] : getChildIds(normalizedId) ?? []).map(normalizeNodeId)

    for (let index = 0; index < queue.length; index += 1) {
        const currentId = queue[index]
        if (!includeSelf && currentId === normalizedId) {
            continue
        }

        if (subtreeIds.has(currentId)) {
            continue
        }

        subtreeIds.add(currentId)
        const childIds = getChildIds(currentId)
        if (childIds && childIds.length > 0) {
            queue.push(...childIds.map(normalizeNodeId))
        }
    }

    return subtreeIds
}

export const collectRootConnectedNodeIds = (nodes: Record<string, Record<string, any>>, parentFieldKey: string): Set<string> => {
    const connectedNodeIds = new Set<string>()

    Object.keys(nodes).forEach(nodeId => {
        let currentId: string | undefined = nodeId
        const path: string[] = []
        const visited = new Set<string>()

        while (currentId && nodes[currentId] && !visited.has(currentId)) {
            if (connectedNodeIds.has(currentId)) {
                path.forEach(id => connectedNodeIds.add(id))
                return
            }

            visited.add(currentId)
            path.push(currentId)
            const parentId = getTreeNodeParentId(nodes[currentId], parentFieldKey)

            if (!isDefined(parentId) || normalizeNodeId(parentId) === TREE_ROOT_ID) {
                path.forEach(id => connectedNodeIds.add(id))
                return
            }

            currentId = String(parentId)
        }
    })

    return connectedNodeIds
}
