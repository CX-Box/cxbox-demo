import { GROUP_PATH_SEPARATOR } from '@components/widgets/Table/groupingHierarchy/constants'

export const parseGroupPath = (path: string) => {
    return path.split(GROUP_PATH_SEPARATOR)
}
