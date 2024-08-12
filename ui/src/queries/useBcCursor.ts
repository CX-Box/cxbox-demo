import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { LoginResponse } from '@cxbox-ui/core'
import { useScreenMeta } from './useScreenMeta'
import { useCallback } from 'react'

type ReturnType = [undefined | null | string, (cursor: string) => void]

export const useBcCursor = (bcName: string): ReturnType => {
    const { data: screenMeta } = useScreenMeta()
    const bc = screenMeta?.meta?.bo.bc.find(bc => bc.name === bcName)
    const queryClient = useQueryClient()
    const setCursor = useCallback(
        (cursor: string) => {
            queryClient.setQueryData(
                ['meta'],
                produce((draft: LoginResponse) => {
                    const screen = draft.screens.find(screen => screen.name === screenMeta?.name)
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
        [bcName, queryClient, screenMeta?.name]
    )
    return [bc?.cursor, setCursor]
}
