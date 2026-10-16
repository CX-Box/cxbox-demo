import { utils } from '@cxbox-ui/core'
import { RootState } from '@store'

/**
 * Checks that the URL has the BC with its cursor id, for example after drillDown to a record.
 * Then the BC data is this record only: data is fetched by the id, the records count is the count of loaded records,
 * and the table shows "Show all records".
 */
export const isCursorInUrl = (state: RootState, bcName: string) => {
    const cursor = state.screen.bo.bc[bcName]?.cursor

    return !!cursor && utils.parseBcCursors(state.router.bcPath ?? '')?.[bcName] === cursor
}
