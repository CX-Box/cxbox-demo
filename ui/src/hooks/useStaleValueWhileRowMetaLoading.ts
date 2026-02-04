import { useAppSelector } from '@store'
import { selectBcMetaInProgress, selectBcUrlRowMeta } from '@selectors/selectors'
import { useEffect, useRef } from 'react'

export const useStaleValueWhileRowMetaLoading = <T extends unknown>(value: T, bcName: string): T => {
    const metaInProgress = useAppSelector(selectBcMetaInProgress(bcName))
    const rowMeta = useAppSelector(selectBcUrlRowMeta(bcName))

    const cachedRef = useRef<T | null>(null)

    useEffect(() => {
        if (!metaInProgress) {
            cachedRef.current = value
        }
    }, [value, metaInProgress])

    if (!rowMeta && metaInProgress && cachedRef.current !== null) {
        return cachedRef.current
    }

    return value
}
