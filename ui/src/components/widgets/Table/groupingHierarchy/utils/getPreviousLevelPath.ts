import { formGroupPath } from '@components/widgets/Table/groupingHierarchy/utils/formGroupPath'
import { parseGroupPath } from '@components/widgets/Table/groupingHierarchy/utils/parseGroupPath'

export const getPreviousLevelPath = (currentPath: string | undefined, currentLevel: number) => {
    if (!currentPath) {
        return null
    }

    return formGroupPath(parseGroupPath(currentPath).slice(0, currentLevel - 1))
}
