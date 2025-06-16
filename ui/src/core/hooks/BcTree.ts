/* eslint-disable react-hooks/rules-of-hooks */
import { Store } from '../data/Store.ts'
import { useCallback, useMemo } from 'react'
import { UnionState } from '../data/slices'
import { BcMeta } from '../contract/appMeta.ts'

export class BcTree<State extends UnionState> {
    constructor(protected store: Store<State>) {}

    useScreenBcPath(bcName: string) {
        /**
         * All bc's used on this screen
         */
        const bcList = this.store.useStore(state => state.bcTree)
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
            const branchFromLeaves: Omit<BcMeta, 'url'>[] = []
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
                 * Collect path keys for every step of the ladder
                 * then we should search empty cursors from both sides
                 * It's means that if indexes of cursors are different
                 * and path can't be built correctly because there's no
                 * option to make path without intermediate bc cursors
                 * For querying allowed only last null cursor
                 */
                const draftPathKeys = step.map(bc => [bc.name, bc.cursor || null]).flat()
                const firstNullCursorIndex = draftPathKeys.indexOf(null)
                const lastNullCursorIndex = draftPathKeys.lastIndexOf(null)
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
        const setBcCursor = this.store.useStore(state => state.setBcCursor)
        const setThisCursor = useCallback((cursor: string) => setBcCursor(bcName, cursor), [bcName, setBcCursor])

        const thisBcPath = bcPaths[bcPaths.length - 1] || null

        return {
            thisBcPath,
            bcPaths,
            cursor,
            setCursor: setThisCursor
        }
    }
}
