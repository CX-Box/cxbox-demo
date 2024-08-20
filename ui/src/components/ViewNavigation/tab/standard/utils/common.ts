const PATH_SEPARATOR = '/'

export const getNodePath = (parentPath: string | undefined, uniqueValue: string) =>
    parentPath ? [parentPath, uniqueValue].join(PATH_SEPARATOR) : uniqueValue

export const getArrayFromNodePath = (path?: string) => path?.split(PATH_SEPARATOR)

export const isViewNavigationItem = (item: object): item is { viewName?: unknown } => !!item && 'viewName' in item

export const hasTitle = (item: object): item is { title?: unknown } => !!item && 'title' in item
