import { useMemo } from 'react'
import { useAppSelector } from '@store'
import { getBcPaginationTypes } from '@features/pagination/utils/common'

export const useBcPaginationModes = (bcName?: string) => {
    const widgets = useAppSelector(state => state.view.widgets)
    const alternativePagination = useAppSelector(state => state.screen.alternativePagination)

    return useMemo(() => getBcPaginationTypes(bcName, widgets, alternativePagination), [alternativePagination, bcName, widgets])
}
