import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginResponse } from '@cxbox-ui/core'
import { useEffect, useMemo } from 'react'
import { CxBoxApiInstance } from '../../api'
import { BcPath, useScreenBcPath, useScreenMeta } from './'
import { produce } from 'immer'

export const useData = (bcName: string, cursor?: string | null) => {
    const queryClient = useQueryClient()
    const { data: screenMeta } = useScreenMeta()
    const { bcPaths } = useScreenBcPath(bcName)

    /**
     * Array of keys for prefetching, if bc is parent then this array would be empty.
     * Recursively slices keys, also all prefetch bcPaths should exclude their own cursors to reduce number of useless requests
     */
    // const prefetchBc = useMemo(() => {
    //     const prefetchPathList: BcPath[] = []
    //     sliceLastBcKeys(bcPaths)
    //     function sliceLastBcKeys(keys: BcPath) {
    //         const currentPath = keys.slice(0, -2)
    //         if (currentPath.length !== 0) {
    //             prefetchPathList.push(currentPath.slice(0, -1))
    //             sliceLastBcKeys(currentPath)
    //         }
    //     }
    //
    //     return prefetchPathList.reverse()
    // }, [bcPaths])

    //prefetch data for parent bc
    const prefetchData = useQueries({
        queries: bcPaths.map(bc => {
            return {
                queryKey: ['data', bc],
                queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', bc).toPromise(),
                enabled: bc !== ''
            }
        }),
        combine: result => {
            /**
             * Combine function is using for ability to set first cursors of each BC list of cascade prefetching
             * Used only for initial data fetching
             */
            return result.map((query, index) => {
                return [prefetchBc[index][prefetchBc.length - 1], query.data?.data?.[0]?.id ? query.data.data[0].id : null]
            })
        }
    })

    useEffect(() => {
        prefetchData.forEach(([bcName, cursor]) => {
            if (bcName !== null && cursor !== null) {
                queryClient.setQueryData(
                    ['meta'],
                    produce((draft: LoginResponse) => {
                        const screen = draft.screens.find(screen => screen.name === screenMeta?.name)
                        const bc = screen?.meta?.bo.bc.find(bc => bc.name === bcName)
                        if (bc && !bc.cursor) {
                            bc.cursor = cursor
                        }
                    })
                )
            }
        })
    }, [prefetchData, queryClient, screenMeta])

    const thisBcPath = useMemo(() => {
        const path = cursor ? bcPaths : bcPaths.slice(0, -1)
        if (path.every(key => key !== null)) {
            return path
        }
        return []
    }, [bcPaths, cursor])

    return useQuery({
        queryKey: ['data', ...thisBcPath],
        queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', thisBcPath.join('/')).toPromise(),
        enabled: thisBcPath.length > 0
    })
}
