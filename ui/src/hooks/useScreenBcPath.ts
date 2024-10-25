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

        return bcLadder.map((step, i) => {
            /**
             * collect path keys for every step of the ladder
             * then we should search empty cursors from both sides
             * it's means that if indexes of cursors are different
             * and path can't be built correctly because there's no
             * option to make path without previous bc cursor
             */
            const draftPathKeys = step.map(bc => [bc.name, bc.cursor]).flat()
            const firstNullCursorIndex = draftPathKeys.findIndex(key => key === null || key === '')
            const lastNullCursorIndex = draftPathKeys.findLastIndex(key => key === null || key === '')
            if (firstNullCursorIndex !== lastNullCursorIndex) {
                return null
            }
            return draftPathKeys.slice(0, lastNullCursorIndex).join('/')
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
