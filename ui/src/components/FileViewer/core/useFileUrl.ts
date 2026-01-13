import { createLocalCache } from '@utils/localCache'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@store'
import { CxBoxApiInstance } from '../../../api'
import { utils } from '@cxbox-ui/core'

const localCache = createLocalCache<string>(cachedUrl => {
    URL.revokeObjectURL(cachedUrl)
})

export const useFileUrl = (url: string | undefined) => {
    const [blobUrl, setBlobUrl] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!url) {
            setBlobUrl('')
            setLoading(false)
            return
        }

        let isStale = false

        const handleLoaded = (newCachedUrl?: string) => {
            if (!newCachedUrl) {
                return
            }
            setBlobUrl(newCachedUrl)
            setLoading(false)
        }

        const handleError = (error: any) => {
            if (!isStale) {
                setLoading(false)
            }

            const apiErrorAction = utils.createApiError(error)
            if (apiErrorAction) {
                dispatch(apiErrorAction)
            }
        }

        const unsubscribe = localCache.subscribe(url, handleLoaded)

        const cachedUrl = localCache.get(url)

        if (cachedUrl) {
            handleLoaded(cachedUrl)
        } else {
            setLoading(true)
            localCache
                .run(url, () => CxBoxApiInstance.getBlob(url, { preview: true }).then(response => URL.createObjectURL(response.data)))
                .catch(handleError)
        }

        return () => {
            isStale = true
            unsubscribe()
        }
    }, [url, dispatch])

    return { blobUrl, loading }
}
