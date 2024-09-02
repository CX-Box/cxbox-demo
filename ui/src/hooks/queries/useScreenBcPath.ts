import { useCallback, useMemo } from 'react'
import { BcMeta, LoginResponse } from '@cxbox-ui/core'
import { useScreenMeta } from '@hooks/queries/useScreenMeta'
import { produce } from 'immer'
import { useQueryClient } from '@tanstack/react-query'

/**
 * introduced as [bcName1, cursor1, bcName2, cursor2,...]
 */
export type BcPath = Array<string | null>

export const useScreenBcPath = (bcName: string) => {
    const { data: thisScreen } = useScreenMeta()
    const queryClient = useQueryClient()
    /**
     * All bc's used on this screen
     */
    const bcList = thisScreen?.meta?.bo.bc
    const thisBc = bcList?.find(bc => bc.name === bcName)
    /**
     * Cursor of this BC
     */
    const cursor = thisBc?.cursor || null

    /**
     * Memoized array of keys, including current bc's name and cursor.
     * If you need to exclude this values, (e.g. for prefetching data) just slice two last elements of this array.
     * IMPORTANT: Cursors can be nullish, only last null cursor allows you to build correct bcPath
     * @example [parent1Name, parent1Cursor, parent2Name, parent2Cursor, ..., bcName, cursor]
     */
    const bcPaths = useMemo(() => {
        let branchFromLeaves: BcMeta[] = []
        // find this bc
        if (thisBc) {
            branchFromLeaves.push(thisBc)
            if (thisBc.parentName !== null) {
                collectDirectParents(thisBc.parentName)
            }
        }
        function collectDirectParents(parentBcName: string) {
            const parent = bcList?.find(bc => bc.name === parentBcName)
            if (parent) {
                branchFromLeaves.push(parent)
                if (parent.parentName !== null) {
                    collectDirectParents(parent.parentName)
                }
            }
        }
        const branchFromRoot = branchFromLeaves.reverse()

        return branchFromRoot.reduce<string[]>((acc, meta, i) => {
            if (i === 0 && meta.cursor === null) {
                acc.push(meta.name)
                return acc
            }

            if (meta.cursor !== null) {
                acc.push([...acc, meta.name, meta.cursor].join('/'))
                return acc
            }

            acc.push('')
            return acc
        }, [])
    }, [bcList, thisBc])

    /**
     * Method for changing current cursor
     * Recursively nullifies all child cursors for tree reload
     */
    const setCursor = useCallback(
        (cursor: string) => {
            queryClient.setQueryData(
                ['meta'],
                produce((draft: LoginResponse) => {
                    const screen = draft.screens.find(screen => screen.name === thisScreen?.name)
                    const currentBc = screen?.meta?.bo.bc.find(val => val.name === bcName)
                    if (currentBc) {
                        currentBc.cursor = cursor
                        recursiveNullifyChildrenCursors(currentBc.name)
                    }

                    function recursiveNullifyChildrenCursors(parentBcName: string) {
                        const children = screen?.meta?.bo.bc.filter(child => child.parentName === parentBcName)

                        children?.forEach(child => {
                            child.cursor = null
                            recursiveNullifyChildrenCursors(child.name)
                        })
                    }
                })
            )
        },
        [bcName, queryClient, thisScreen?.name]
    )

    return {
        bcPaths,
        cursor,
        setCursor
    }
}
