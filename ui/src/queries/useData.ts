import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { BcMeta, LoginResponse } from '@cxbox-ui/core'
import { useEffect, useMemo } from 'react'
import { CxBoxApiInstance } from '../api'
import { useScreenBcMeta, useScreenMeta } from './'
import { produce } from 'immer'

// function to build keys array
const keyBuilder = (bcs: BcMeta[], lastCursor?: string) => {
    //collect all keys without last cursor
    const bcKeys = bcs?.reduce<(string | null)[]>((acc, bc, index) => {
        if (index !== bcs.length - 1) {
            acc.push(bc.name, bc.cursor)
        } else {
            acc.push(bc.name)
            if (lastCursor) {
                acc.push(lastCursor)
            }
        }
        return acc
    }, [])
    //check keys for nullish or empty cursors to disable wrong keys query
    if (bcKeys.every(key => !!key)) {
        return bcKeys
    }

    return []
}

export const useData = (bcName: string, cursor?: string) => {
    const queryClient = useQueryClient()
    const { data: screenMeta } = useScreenMeta()
    const { data: bcMetaList } = useScreenBcMeta(bcName)
    const prefetchBc = useMemo(() => {
        return bcMetaList ? bcMetaList.slice(0, -1) : []
    }, [bcMetaList])

    //prefetch data for parent bc
    const prefetchData = useQueries({
        queries: prefetchBc.map((bc, index, arr) => {
            const keyArr = keyBuilder(arr.slice(0, index + 1))
            return {
                queryKey: ['data', ...keyArr],
                queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', keyArr.join('/')).toPromise(),
                enabled: keyArr.length > 0
            }
        }),
        combine: result => {
            let combination: Record<string, (typeof result)[number]> = {}
            for (let i = 0; i < prefetchBc.length; i++) {
                combination[prefetchBc[i].name] = result[i]
            }
            return combination
        }
    })

    useEffect(() => {
        Object.entries(prefetchData).forEach(([pKey, pData]) => {
            if (pData.isFetched && pData.data) {
                queryClient.setQueryData(
                    ['meta'],
                    produce((draft: LoginResponse) => {
                        const screen = draft.screens.find(screen => screen.name === screenMeta?.name)
                        const bc = screen?.meta?.bo.bc.find(bc => bc.name === pKey)
                        if (bc && !bc.cursor) {
                            const cursor = pData.data?.data[0]?.id ? pData.data?.data[0]?.id : null
                            bc.cursor = cursor
                        }
                    })
                )
            }
        })
    }, [prefetchData, queryClient, screenMeta])

    const thisBcKeys = useMemo(() => {
        return keyBuilder(bcMetaList || [], cursor)
    }, [bcMetaList, cursor])

    return useQuery({
        queryKey: ['data', ...thisBcKeys],
        queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', thisBcKeys.join('/')).toPromise(),
        enabled: thisBcKeys.length > 0
    })
}
