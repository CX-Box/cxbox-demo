import { FIELDS } from '@constants'
import { FieldType, PickListFieldMeta } from '@cxbox-ui/core'
import { useEffect } from 'react'

function getAssociateFieldKeyForPickList(fieldMeta: PickListFieldMeta) {
    if (!fieldMeta?.pickMap) {
        return null
    }

    return Object.entries(fieldMeta.pickMap).reduce((acc: null | string, [key, value]) => {
        if (value === FIELDS.TECHNICAL.ID) {
            return key
        }

        return acc
    }, null)
}

export function useAssociateFieldKeyForPickList(fieldMeta: PickListFieldMeta) {
    const isPickList = fieldMeta.type === FieldType.pickList
    const associateFieldKeyForPickList = getAssociateFieldKeyForPickList(fieldMeta)

    useEffect(() => {
        if (isPickList && !associateFieldKeyForPickList) {
            console.info(`pickmap with "id" on right side not found - filter will be applied to field referenced in "key"`)
        }
    }, [associateFieldKeyForPickList, isPickList])

    return {
        associateFieldKeyForPickList
    }
}
