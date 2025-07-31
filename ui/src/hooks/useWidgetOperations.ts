import { useMemo } from 'react'
import { OperationScope, isOperationGroup, Operation, OperationGroup, OperationInclusionDescriptor, WidgetMeta } from '@cxbox-ui/core'
import { WidgetOperations } from '@cxbox-ui/schema'
import { selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { useAppSelector } from '@store'

const emptyArray: Array<Operation | OperationGroup> = []

/**
 * Returns a memoized array of operations with respect to include/exclude list in widget meta configuration
 *
 * @param operations List of operations
 * @param widgetMeta Widget meta configuration
 * @param bcName BC name in case of hierarchy usage
 * @category Hooks
 */
export function useWidgetOperations(operations: Array<Operation | OperationGroup>, widgetMeta: WidgetMeta, bcName: string = '') {
    return useMemo(() => {
        const operationsHierarchy = widgetMeta?.options?.hierarchy
        const isHierarchy = operationsHierarchy ? operationsHierarchy.length > 0 : false
        const actionGroup =
            widgetMeta.options?.actionGroups &&
            (isHierarchy ? (widgetMeta.options.actionGroups as Record<string, WidgetOperations>)[bcName] : widgetMeta.options.actionGroups)
        if (!actionGroup) {
            return operations || emptyArray
        }

        const { include, exclude } = actionGroup
        return getIncludedOperations(
            operations || emptyArray,
            include as OperationInclusionDescriptor[],
            exclude as OperationInclusionDescriptor[]
        )
    }, [operations, widgetMeta, bcName])
}

export function useWidgetOperationsNew(widgetName: string = '', scopes?: OperationScope[], includeEmptyGroups?: boolean) {
    const widgetMeta = useAppSelector(state => selectWidget(state, widgetName))
    const operations = useAppSelector(state => selectBcUrlRowMeta(state, widgetMeta?.bcName)?.actions) || emptyArray
    const { include, exclude } = widgetMeta?.options?.actionGroups || {}

    return useMemo(() => {
        return getIncludedOperations(
            operations,
            include as OperationInclusionDescriptor[],
            exclude as OperationInclusionDescriptor[],
            scopes,
            includeEmptyGroups
        )
    }, [operations, include, exclude, scopes, includeEmptyGroups])
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
 * @param scopes
 * @param includeEmptyGroups
 * @category Utils
 */
export function getIncludedOperations(
    operations: Array<Operation | OperationGroup>,
    include?: OperationInclusionDescriptor[] | null,
    exclude?: OperationInclusionDescriptor[] | null,
    scopes?: OperationScope[],
    includeEmptyGroups: boolean = true
) {
    const result: Array<Operation | OperationGroup> = []
    operations.forEach(item => {
        if (shouldPickOperation(item, include, exclude, scopes)) {
            if (isOperationGroup(item)) {
                const filtered = item.actions.filter(operation => {
                    if (!include) {
                        return shouldPickOperation(operation, null, exclude, scopes)
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

                    return shouldPickOperation(operation, includeAll, excludeAll, scopes)
                })

                if (filtered.length || includeEmptyGroups) {
                    result.push({ ...item, actions: filtered })
                }
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
export function operationPicked(
    item: Operation | OperationGroup,
    include?: OperationInclusionDescriptor[] | null,
    exclude?: OperationInclusionDescriptor[] | null
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

export function shouldPickOperation(
    item: Operation | OperationGroup,
    include?: OperationInclusionDescriptor[] | null,
    exclude?: OperationInclusionDescriptor[] | null,
    scopes?: OperationScope[]
) {
    const isNecessaryScopes = (currentScope: OperationScope) => (scopes?.length ? scopes.includes(currentScope) : true)

    if (isOperationGroup(item)) {
        return (
            operationPicked(item, include, exclude) ||
            item.actions.some(action => operationPicked(action, include, exclude) && isNecessaryScopes(action.scope))
        )
    }

    return operationPicked(item, include, exclude) && isNecessaryScopes(item.scope)
}

/**
 * Получает тип операции из элемента списка включения/исключения
 *
 * @param descriptor Строка или объект с этой строкой
 */
function getDescriptorValue(descriptor: OperationInclusionDescriptor) {
    if (typeof descriptor === 'string') {
        return descriptor
    }
    return descriptor.type
}
