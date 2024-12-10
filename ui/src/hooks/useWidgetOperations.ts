import { useMemo } from 'react'
import { interfaces } from '@cxbox-ui/core'

const { isOperationGroup } = interfaces

const emptyArray: Array<interfaces.Operation | interfaces.OperationGroup> = []

/**
 * Returns a memoized array of operations with respect to include/exclude list in widget meta configuration
 *
 * @param operations List of operations
 * @param widgetMeta Widget meta configuration
 * @param bcName BC name in case of hierarchy usage
 * @category Hooks
 */
export function useWidgetOperations(
    operations: Array<interfaces.Operation | interfaces.OperationGroup>,
    widgetMeta: interfaces.WidgetMeta,
    bcName: string = ''
) {
    return useMemo(() => {
        const operationsHierarchy = widgetMeta?.options?.hierarchy
        const isHierarchy = operationsHierarchy ? operationsHierarchy.length > 0 : false
        const actionGroup =
            widgetMeta.options?.actionGroups &&
            (isHierarchy
                ? (widgetMeta.options.actionGroups as Record<string, interfaces.WidgetOperations>)[bcName]
                : widgetMeta.options.actionGroups)
        if (!actionGroup) {
            return operations || emptyArray
        }

        const { include, exclude } = actionGroup
        return getIncludedOperations(
            operations || emptyArray,
            include as interfaces.OperationInclusionDescriptor[],
            exclude as interfaces.OperationInclusionDescriptor[]
        )
    }, [operations, widgetMeta, bcName])
}

/**
 * Returns an array of operations with respect to include/exclude lists.
 *
 * If element is an operation group than its nested operations also checked against inclusion/exclusion lists;
 * noth inclusion/exclusion lists from arguments and from group declarations are checked against.
 *
 * @param operations List of operations
 * @param include List of operations to include
 * @param exclude List of operations to exclude
 * @category Utils
 */
export function getIncludedOperations(
    operations: Array<interfaces.Operation | interfaces.OperationGroup>,
    include?: interfaces.OperationInclusionDescriptor[] | null,
    exclude?: interfaces.OperationInclusionDescriptor[] | null
) {
    const result: Array<interfaces.Operation | interfaces.OperationGroup> = []
    operations.forEach(item => {
        if (shouldPickOperationOrGroupWithOperation(item, include, exclude)) {
            if (isOperationGroup(item)) {
                const filtered = item.actions.filter(operation => {
                    if (!include) {
                        return shouldPickOperation(operation, null, exclude)
                    }

                    const nestedDescriptor = include.find(descriptor => getDescriptorValue(descriptor) === item.type)

                    const excludeAll =
                        nestedDescriptor && typeof nestedDescriptor === 'string'
                            ? [nestedDescriptor, ...(exclude || [])]
                            : [...((nestedDescriptor as any)?.exclude || []), ...(exclude || [])]

                    const includeAll =
                        typeof nestedDescriptor === 'object'
                            ? nestedDescriptor.include
                            : typeof nestedDescriptor === 'string'
                            ? null
                            : include

                    return shouldPickOperation(operation, includeAll, excludeAll)
                })
                result.push({ ...item, actions: filtered })
            } else {
                result.push(item)
            }
        }
    })
    return result
}

/**
 * Checks operation or operation group against inclusion/exclusion lists:
 * - if inclusion list is specified then operation should be present there and shouldn't be present in exlusion list
 * - if inlusion list is not specified then operation should be absent from exclusion list
 *
 * @param item Operation or operation group to check
 * @param include List of operations to include
 * @param exclude List of operations to exclude
 * @category Utils
 */
export function shouldPickOperation(
    item: interfaces.Operation | interfaces.OperationGroup,
    include?: interfaces.OperationInclusionDescriptor[] | null,
    exclude?: interfaces.OperationInclusionDescriptor[] | null
) {
    if (!include && exclude) {
        return exclude.every(descriptor => getDescriptorValue(descriptor) !== item.type)
    }
    if (include && !exclude) {
        return include.some(descriptor => getDescriptorValue(descriptor) === item.type)
    }
    if (include && exclude) {
        return (
            include.some(descriptor => getDescriptorValue(descriptor) === item.type) &&
            exclude.every(descriptor => getDescriptorValue(descriptor) !== item.type)
        )
    }
    return true
}

export function shouldPickOperationOrGroupWithOperation(
    item: interfaces.Operation | interfaces.OperationGroup,
    include?: interfaces.OperationInclusionDescriptor[] | null,
    exclude?: interfaces.OperationInclusionDescriptor[] | null
) {
    if (isOperationGroup(item)) {
        return shouldPickOperation(item, include, exclude) || item.actions.some(action => shouldPickOperation(action, include, exclude))
    }

    return shouldPickOperation(item, include, exclude)
}

/**
 * Получает тип операции из элемента списка включения/исключения
 *
 * @param descriptor Строка или объект с этой строкой
 */
function getDescriptorValue(descriptor: interfaces.OperationInclusionDescriptor) {
    if (typeof descriptor === 'string') {
        return descriptor
    }
    return descriptor.type
}
