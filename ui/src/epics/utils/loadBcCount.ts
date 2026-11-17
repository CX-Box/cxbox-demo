import { catchError, filter, mergeMap, of } from 'rxjs'
import { StateObservable } from 'redux-observable'
import { AxiosError } from 'axios'
import { utils } from '@cxbox-ui/core'
import { RootState } from '@store'
import { setBcCount } from '@actions'
import { EMPTY_ARRAY } from '@constants'
import { buildBcUrl } from '@utils/buildBcUrl'
import { isCursorInUrl } from '@utils/isCursorInUrl'
import { CxBoxApiInstance } from '../../api'

/**
 * Count of BC records for the pagination.
 * A BC with its cursor id in the URL has this record only: the count is the count of loaded records, without a request.
 * A response that comes when the BC already has the cursor record only is skipped.
 */
export const loadBcCount = (state$: StateObservable<RootState>, api: typeof CxBoxApiInstance, bcName: string) => {
    const state = state$.value

    if (isCursorInUrl(state, bcName)) {
        return of(setBcCount({ bcName, count: state.data[bcName]?.length ?? 0 }))
    }

    const filters = utils.getFilters(state.screen.filters[bcName] || EMPTY_ARRAY)

    return api.fetchBcCount(state.screen.screenName, buildBcUrl(bcName), filters).pipe(
        // state at the response time: the BC may already have the cursor record only
        filter(() => !isCursorInUrl(state$.value, bcName)),
        mergeMap(({ data }) => of(setBcCount({ bcName, count: data }))),
        catchError((error: AxiosError) => utils.createApiErrorObservable(error))
    )
}
