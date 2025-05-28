import React from 'react'
import { isWidgetFieldBlock, WidgetFieldsOrBlocks } from '@cxbox-ui/core'
/**
 * Receive flat list of fields from array containing fields or field blocks.
 *
 * @template T Field type
 * @param fields Array of fields or field blocks
 * @category Hooks
 */
export function useFlatFormFields<T>(fields: WidgetFieldsOrBlocks<T>) {
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
