import { useAppSelector } from '@store'
import { selectBcUrlRowMeta } from '@selectors/selectors'
import { useEffect, useRef } from 'react'
import { RowMeta } from '@interfaces/rowMeta'

// TODO rewrite the implementation to a variant with the cursor and without useRef
export const useRowMetaWithCache = (bcName: string, includeSelf?: boolean) => {
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])
    const rowMeta = useAppSelector(state => selectBcUrlRowMeta(state, bcName, includeSelf))

    const cached = useRef<RowMeta | null>(null)

    useEffect(() => {
        if (!metaInProgress) {
            cached.current = rowMeta ?? null
        }
    }, [metaInProgress, rowMeta])

    useEffect(() => {
        return () => {
            cached.current = null
        }
    }, [])

    // If the download is in progress, but there is no new data → use the cache
    if (!rowMeta && metaInProgress && cached.current) {
        return cached.current
    }

    return rowMeta
}
