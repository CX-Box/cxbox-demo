import { useCallback, useMemo } from 'react'
import { BcMeta, LoginResponse } from '@cxbox-ui/core'
import { useScreenMeta } from '@hooks/queries/useScreenMeta'
import { produce } from 'immer'
import { useQueryClient } from '@tanstack/react-query'

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
     * Memoized array of parent paths, including current bc name without cursor.
     * If any intermediate cursor is null path for fetching can't be built.
     * @example [bcName1, bcName1/cursor1/bcName2, bcName1/cursor1/bcName2/cursor2/bcName3]
     * @example [bcName1, null, null]
     */
    const bcPaths = useMemo(() => {
        let branchFromLeaves: BcMeta[] = []
        // recursively accumulate all bc from leaves to roots
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

        /**
         * now we should accumulate arrays as ladder, to build string paths in most simple way through map()
         * [bc1],
         * [bc1, bc2],
         * ...
         */

        const bcLadder = branchFromRoot.map((_, i, arr) => arr.slice(0, i + 1))

        return bcLadder.map(step => {
            /**
             * we should know, is in step any intermediate null cursor
             * !! ONLY LAST NULL CURSOR ALLOWED
             */
            const nullBcCursorIndex = step.findIndex(bc => bc.cursor === '' || bc.cursor === null)
            if (nullBcCursorIndex !== step.length - 1) {
                return null
            }

            /**
             * concat step into array of [bcName1, bcCursor1, bcName2, bcCursor2, ...]
             * then join with slashes to make path
             */
            return step
                .reduce<string[]>((acc, bc) => {
                    if (bc.cursor === null) {
                        acc.push(bc.name)
                    } else {
                        acc.push(bc.name, bc.cursor as string)
                    }
                    return acc
                }, [])
                .join('/')
        })
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

    const thisBcPath = bcPaths[bcPaths.length - 1]

    return {
        thisBcPath,
        bcPaths,
        cursor,
        setCursor
    }
}
