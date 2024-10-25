import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginResponse } from '@cxbox-ui/core'
import { useEffect, useMemo } from 'react'
import { CxBoxApiInstance } from '../../api'
import { useScreenMeta } from './'
import { produce } from 'immer'
import { useScreenBcPath } from '@hooks/useScreenBcPath'

export const useData = (bcName: string, cursor?: string | null) => {
    const queryClient = useQueryClient()
    const { data: screenMeta } = useScreenMeta()
    const { bcPaths, thisBcPath, setCursor } = useScreenBcPath(bcName)

    const prefetchPaths = useMemo(() => {
        return bcPaths.slice(0, -1).filter(path => path !== null) as string[]
    }, [bcPaths])

    //prefetch data for parent bc
    const prefetchData = useQueries({
        queries: prefetchPaths.map(bc => {
            return {
                queryKey: ['data', bc],
                queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', bc).toPromise()
            }
        }),
        combine: result => {
            /**
             * Combine function is using for ability to set first cursors of each BC list of cascade prefetching
             */
            return result.map((query, index) => {
                const sliceIndex = prefetchPaths[index].lastIndexOf('/')
                const bcName = prefetchPaths[index].slice(sliceIndex + 1)
                const cursor = query.data?.data?.[0]?.id ? query.data.data[0].id : null
                return [bcName, cursor]
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

    const dataPath = thisBcPath ? (cursor ? `${thisBcPath}/${cursor}` : thisBcPath) : ''

    const query = useQuery({
        queryKey: ['data', dataPath],
        queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', dataPath).toPromise(),
        enabled: thisBcPath !== null
    })

    useEffect(() => {
        if (query.isFetchedAfterMount && query.data?.data[0]?.id && !cursor) {
            setCursor(query.data?.data[0]?.id)
        }
    }, [cursor, query.data?.data, query.isFetchedAfterMount, setCursor])

    return query
}
