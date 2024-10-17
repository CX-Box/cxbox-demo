import { GROUP_PATH_SEPARATOR } from '@components/widgets/Table/groupingHierarchy/constants'

export const formGroupPath = (values: string[]) => {
    return values.join(GROUP_PATH_SEPARATOR)
}
