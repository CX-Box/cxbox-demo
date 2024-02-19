import React from 'react'
import { interfaces } from '@cxbox-ui/core'

const { isWidgetFieldBlock } = interfaces
/**
 * Receive flat list of fields from array containing fields or field blocks.
 *
 * @template T Field type
 * @param fields Array of fields or field blocks
 * @category Hooks
 */
export function useFlatFormFields<T>(fields: interfaces.WidgetFieldsOrBlocks<T>) {
    return React.useMemo(() => {
        const flatFields: T[] = []

        fields.forEach(item => {
            if (isWidgetFieldBlock(item)) {
                item.fields.forEach(field => flatFields.push(field))
            } else {
                flatFields.push(item)
            }
        })

        return flatFields
    }, [fields])
}
