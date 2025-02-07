import { t } from 'i18next'
import { decreaseOpacityPerLevelPercent, totalRowKey } from '../constants'
import { GroupingHierarchyCommonNode } from '@components/widgets/Table/groupingHierarchy'
import { EAggFunction, IAggField, IAggLevel } from '@interfaces/groupingHierarchy'
import { WidgetListField } from '@cxbox-ui/core'

export const getAggCellBgOpacity = (dataItemId: string, groupLevel: number) => {
    return (100 - (dataItemId === totalRowKey ? 0 : groupLevel) * decreaseOpacityPerLevelPercent) / 100
}

export const checkArgFieldsTypeMatching = (aggField: IAggField, fieldsMeta: WidgetListField[]) => {
    aggField.argFieldKeys?.forEach(argField => {
        const aggFieldType = fieldsMeta.find(item => item.key === aggField.fieldKey)?.type
        const argFieldType = fieldsMeta.find(item => item.key === argField)?.type

        if (aggFieldType !== argFieldType) {
            console.info(
                `Error: Aggregate field type for key: ${aggField.fieldKey} in 'fieldKey' do not match field type for key: ${argField} in 'argFieldKeys'`
            )
        }
    })
}

export const getAggFieldKeys = (fieldsMeta: WidgetListField[], aggFields?: IAggField[], aggLevels?: IAggLevel[]) => {
    let aggFieldKeysForCountInit: string[] = []
    let aggFieldKeysForShow: string[] = []

    if (aggFields?.length) {
        aggFields.forEach(aggField => {
            checkArgFieldsTypeMatching(aggField, fieldsMeta)

            if (aggField.argFieldKeys?.length) {
                aggFieldKeysForCountInit.push(...aggField.argFieldKeys)
            } else {
                aggFieldKeysForCountInit.push(aggField.fieldKey)
            }
        })

        aggFieldKeysForShow = aggFields.map(item => item.fieldKey)
    }

    if (aggLevels?.length) {
        aggLevels.forEach(item => {
            item.aggFields.forEach(aggField => {
                checkArgFieldsTypeMatching(aggField, fieldsMeta)

                if (aggField.argFieldKeys?.length) {
                    aggFieldKeysForCountInit.push(...aggField.argFieldKeys)
                } else {
                    aggFieldKeysForCountInit.push(aggField.fieldKey)
                }
            })
        })
    }

    return {
        aggFieldKeysForShow,
        aggFieldKeysForCount: Array.from(new Set(aggFieldKeysForCountInit)) // to remove duplicates
    }
}

export const updateAggFieldValuesPerLevel = (
    currentGroup: GroupingHierarchyCommonNode,
    newGroup: GroupingHierarchyCommonNode,
    aggFieldKeysForCount: string[]
) => {
    if (currentGroup && newGroup) {
        aggFieldKeysForCount.forEach(aggField => {
            const newValue = Array.isArray(newGroup[aggField]) ? newGroup[aggField] : [newGroup[aggField]]
            const currentValue = Array.isArray(currentGroup[aggField]) ? currentGroup[aggField] : [currentGroup[aggField]]
            currentGroup[aggField] = [...currentValue, ...newValue]
        })
    }
}

const getAggFunctionResult = (aggFunc: EAggFunction, values: number[]) => {
    switch (aggFunc) {
        case EAggFunction.sum:
            return values.reduce((acc, number) => acc + Number(number), 0)
        case EAggFunction.min:
            return Math.min(...values)
        case EAggFunction.max:
            return Math.max(...values)
        case EAggFunction.avg:
            return values.reduce((acc, number) => acc + Number(number), 0) / values.length
        default:
            return null
    }
}

export const setAggFieldResult = (currentGroup: GroupingHierarchyCommonNode, aggField: IAggField) => {
    let fieldValues

    if (aggField?.argFieldKeys) {
        fieldValues = []
        aggField.argFieldKeys.forEach(argField =>
            Array.isArray(currentGroup[argField]) ? fieldValues.push(...currentGroup[argField]) : fieldValues.push(currentGroup[argField])
        )
    } else {
        fieldValues = currentGroup[aggField.fieldKey]
    }

    const isSomeValueNaN = Array.isArray(fieldValues) ? fieldValues.some(item => isNaN(Number(item))) : isNaN(Number(fieldValues))

    if (isSomeValueNaN) {
        currentGroup[aggField.fieldKey] = 'NaN'
        console.info(`Error: Some field value for aggregate ${aggField.fieldKey} contains NaN`)
    } else {
        if (Array.isArray(fieldValues)) {
            currentGroup[aggField.fieldKey] = getAggFunctionResult(
                aggField.func,
                fieldValues.filter(item => item !== null && item !== '')
            )
        }
    }

    currentGroup._aggFunctions = {
        ...(currentGroup._aggFunctions || {}),
        [aggField.fieldKey]: aggField.description || aggField.func
    }
}

export const countAggFieldValues = (
    currentGroup: GroupingHierarchyCommonNode,
    aggFieldKeysForShow: string[],
    aggFields?: IAggField[],
    aggLevels?: IAggLevel[]
) => {
    if (currentGroup) {
        const levelAggFieldKeysForShow: string[] = []
        const aggLevel = aggLevels?.find(aggLevelItem => aggLevelItem.level === currentGroup._groupLevel)

        if (aggLevel) {
            aggLevel.aggFields.forEach(levelAggField => {
                levelAggFieldKeysForShow.push(levelAggField.fieldKey)
                setAggFieldResult(currentGroup, levelAggField)
            })
        }

        aggFieldKeysForShow.forEach(aggFieldKey => {
            const aggField = aggFields?.find(
                aggField => aggField.fieldKey === aggFieldKey && !levelAggFieldKeysForShow.includes(aggFieldKey)
            )

            if (aggField) {
                setAggFieldResult(currentGroup, aggField)
            }
        })
    }
}

export const getTotalRow = (key: string, aggFieldKeysForCount: string[], array: any[]) => {
    const total: GroupingHierarchyCommonNode = {
        id: totalRowKey,
        [key]: t('Total'),
        vstamp: 0,
        _groupLevel: 0
    }

    aggFieldKeysForCount.forEach(aggField => (total[aggField] = array.map(item => item[aggField])))

    return total
}
