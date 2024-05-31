import { DataItem, FieldType, WidgetFieldBase } from '@cxbox-ui/schema'
import { CustomFieldTypes, WidgetField } from '@interfaces/widget'
import { changeOrderWithMutate } from '@utils/changeOrderWithMutate'
import { DataValue } from '@cxbox-ui/schema/src/interfaces/data'

export const createTree = (array?: any[], sortedGroupKeys: string[] = [], fields?: WidgetField[]) => {
    const unallocatedRows: any[] = []
    const tree: any[] = []

    array?.forEach(item => {
        const isUnallocatedRow = sortedGroupKeys.some(groupKey => !getGroupPathPart(groupKey, item, getFieldMeta(groupKey, fields)))

        if (isUnallocatedRow) {
            unallocatedRows.push(item)
            return
        }

        let previousLevel = tree
        let groupPathParts: string[] = []

        sortedGroupKeys.forEach((groupKey, index) => {
            const groupValue = item[groupKey]
            const groupPathPart = getGroupPathPart(groupKey, item, getFieldMeta(groupKey, fields))

            groupPathParts.push(groupPathPart)

            let previousLevelObject = previousLevel.find(
                levelItem => getGroupPathPart(groupKey, levelItem, getFieldMeta(groupKey, fields)) === groupPathPart
            )

            if (previousLevelObject === undefined || previousLevelObject === null) {
                previousLevelObject = {
                    [groupKey]: groupValue,
                    id: groupPathParts.join('/'),
                    pseudoRow: true
                }
                previousLevel.push(previousLevelObject)
            }

            if (previousLevelObject.children === undefined || previousLevelObject.children === null) {
                previousLevelObject.children = []
            }

            if (index === sortedGroupKeys.length - 1) {
                previousLevelObject.children.push(item)
            }

            previousLevel = previousLevelObject.children
        })
    })

    return [...unallocatedRows, ...tree]
}

function getGroupPathPart(key: string, record: Record<string, any> | undefined, fieldMeta?: WidgetField) {
    if (!fieldMeta) {
        return record?.[key]
    }

    if (
        [FieldType.multivalueHover, FieldType.multivalue, CustomFieldTypes.MultipleSelect].includes(fieldMeta.type) ||
        Array.isArray(record?.[key])
    ) {
        return Array.isArray(record?.[key]) ? (record?.[key] as { id: string }[]).map(item => item.id).join(';') : undefined
    }

    return record?.[key]
}

function getFieldMeta<T extends WidgetFieldBase>(key: string, fields?: T[]) {
    return fields?.find(field => field.key === key)
}

export const getNodesPathsToLeaf = (leaf: Record<string, any> | undefined, sortedGroupKeys: string[] = [], fields?: WidgetField[]) => {
    if (leaf) {
        const groupPathParts: string[] = []
        const paths: string[] = []

        sortedGroupKeys?.forEach(fieldKey => {
            const groupPathPart = getGroupPathPart(fieldKey, leaf, getFieldMeta(fieldKey, fields))

            if (groupPathPart) {
                groupPathParts.push(groupPathPart)
                paths.push(groupPathParts.join('/'))
            }
        })

        return sortedGroupKeys.length === paths.length ? paths : undefined
    }

    return
}

const isExistRecordItem = (item: DataValue | undefined) => {
    // eslint-disable-next-line eqeqeq
    return (item != undefined && item !== '' && !Array.isArray(item)) || (Array.isArray(item) && item?.length)
}

export const isUnallocatedRecord = (record: DataItem | undefined, sortedGroupKeys: string[] = []) => {
    return sortedGroupKeys.some(key => {
        // eslint-disable-next-line eqeqeq
        return !isExistRecordItem(record?.[key])
    })
}

export const findNewPosition = (records: DataItem[], newRecord: DataItem | undefined, sortedGroupKeys: string[]) => {
    const startingIndexesMap: Record<string, number> = {}
    let lastUnallocatedIndex = -1

    records.findIndex((item, index) => {
        if (isUnallocatedRecord(item, sortedGroupKeys)) {
            lastUnallocatedIndex = index
        }

        if (item.id === newRecord?.id) {
            return false
        }

        let isNewPosition = false
        let i = 0

        do {
            const groupKey = sortedGroupKeys[i]
            const nextGroupValue = getGroupPathPart(groupKey, newRecord)
            const currentValue = getGroupPathPart(groupKey, item)
            const groupValuesAreEqual = currentValue === nextGroupValue

            isNewPosition = i === 0 ? groupValuesAreEqual : isNewPosition && groupValuesAreEqual

            if (isNewPosition && !startingIndexesMap[groupKey]) {
                startingIndexesMap[groupKey] = index
            }

            i = i + 1
        } while (sortedGroupKeys[i] && isNewPosition)

        return isNewPosition
    })

    let newPosition = startingIndexesMap[sortedGroupKeys.findLast(key => startingIndexesMap[key]) as string] ?? -1

    // needed to position the element before the found group
    newPosition = newPosition !== -1 && newPosition !== 0 ? newPosition - 1 : newPosition

    return newPosition !== -1 ? newPosition : lastUnallocatedIndex ?? -1
}

export const changeRecordPositionMutate = (records: DataItem[], record: DataItem, sortedGroupKeys: string[]) => {
    const newRecord = record ? record : undefined
    const oldIndex = records.findIndex(item => item.id === newRecord?.id)

    if (!isUnallocatedRecord(newRecord, sortedGroupKeys)) {
        const newIndex = findNewPosition(records, newRecord, sortedGroupKeys)

        if (newIndex !== -1) {
            changeOrderWithMutate(records, oldIndex, newIndex)
        }
    }
}
