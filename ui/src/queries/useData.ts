import { useQueries, useQuery } from '@tanstack/react-query'
import { RootState, useAppSelector } from '@store'
import { createSelector } from '@reduxjs/toolkit'
import { BcMeta } from '@cxbox-ui/core'
import { useEffect, useMemo } from 'react'
import { CxBoxApiInstance } from '../api'
import { useScreenMeta } from './useMeta'
import { useDispatch } from 'react-redux'
import { changeBcCursor } from '@actions'

const makeBcBranchSelector = () =>
    createSelector([(state: RootState) => state.screenBcTrees, (state: RootState, bcName: string) => bcName], (bcs, bcName) => {
        // recursive find all parents
        let branch: BcMeta[] = []
        // find this bc
        const thisBc = bcs.find(bc => bc.name === bcName)
        if (thisBc) {
            branch.push(thisBc)
            if (thisBc.parentName !== null) {
                collectDirectParents(thisBc.parentName)
            }
        }
        function collectDirectParents(parentBcName: string) {
            const parent = bcs.find(bc => bc.name === parentBcName)
            if (parent) {
                branch.push(parent)
                if (parent.parentName !== null) {
                    collectDirectParents(parent.parentName)
                }
            }
        }

        return branch.reverse()
    })

// function to build keys array
const keyBuilder = (bcs: BcMeta[], lastCursor?: string) => {
    //collect all keys without last cursor
    const bcKeys = bcs.reduce<(string | null)[]>((acc, bc, index) => {
        if (index !== bcs.length - 1) {
            acc.push(bc.name, bc.cursor)
        } else {
            acc.push(bc.name)
            if (lastCursor !== undefined) {
                acc.push(lastCursor)
            }
        }
        return acc
    }, [])
    //check keys for nullish or empty cursors to disable wrong keys query
    if (bcKeys.every(key => key !== '' && key !== null)) {
        return bcKeys
    }

    return []
}

export const useData = (bcName: string, cursor?: string) => {
    const dispatch = useDispatch()
    const { data: screenMeta } = useScreenMeta()
    const bcBranchSelector = useMemo(() => makeBcBranchSelector(), [])
    const thisBcMetas = useAppSelector(state => bcBranchSelector(state, bcName))
    const prefetchBcs = useMemo(() => thisBcMetas.slice(0, -1), [thisBcMetas])

    //prefetch data for parent bc
    const prefetchData = useQueries({
        queries: prefetchBcs.map((bc, index, arr) => {
            const keyArr = keyBuilder(arr.slice(0, index + 1))
            console.log(keyArr)
            return {
                queryKey: ['data', ...keyArr],
                queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', keyArr.join('/')).toPromise(),
                enabled: keyArr.length > 0
            }
        }),
        combine: result => {
            let combination: Record<string, (typeof result)[number]> = {}
            for (let i = 0; i < prefetchBcs.length; i++) {
                combination[prefetchBcs[i].name] = result[i]
            }
            return combination
        }
    })

    useEffect(() => {
        Object.entries(prefetchData).forEach(([pKey, pData]) => {
            if (pData.isFetched && pData.data) {
                // TODO: POFIXIY KURSORI YOBA
                dispatch(changeBcCursor({ bcName: pKey, cursor: pData.data.data[0].id }))
            }
        })
    }, [dispatch, prefetchData])

    const thisBcKeys = useMemo(() => {
        return keyBuilder(thisBcMetas, cursor)
    }, [thisBcMetas, cursor])

    useQuery({
        queryKey: ['rowMeta', ...thisBcKeys],
        queryFn: () => CxBoxApiInstance.fetchRowMeta(screenMeta?.name || '', thisBcKeys.join('/')).toPromise(),
        enabled: thisBcKeys.length > 0
    })

    return useQuery({
        queryKey: ['data', ...thisBcKeys],
        queryFn: () => CxBoxApiInstance.fetchBcData(screenMeta?.name || '', thisBcKeys.join('/')).toPromise(),
        enabled: thisBcKeys.length > 0
    })
}
