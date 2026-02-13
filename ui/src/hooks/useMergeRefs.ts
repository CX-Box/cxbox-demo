import React, { Ref, RefCallback, useCallback } from 'react'

function assignRef<T>(ref: Ref<T> | undefined | null, value: T | null): void {
    if (typeof ref === 'function') {
        ref(value)
    } else if (ref) {
        ;(ref as React.MutableRefObject<T | null>).current = value
    }
}

/**
 * @warning The number of merged refs should be static
 * @param refs
 */
export function useMergeRefs<T>(refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
    return useCallback((value: T) => {
        refs.forEach(ref => {
            assignRef(ref, value)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, refs)
}
