import { parseGroupPath } from '@components/widgets/Table/groupingHierarchy/utils/parseGroupPath'
import { formGroupPath } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPath'

export const getAllPathsOfTreeParentNodesUpToCurrentOne = (currentGroupPath?: string) => {
    return currentGroupPath
        ? parseGroupPath(currentGroupPath).map((_: string, index: number, arr: string[]) => formGroupPath(arr.slice(0, index + 1)))
        : []
}
