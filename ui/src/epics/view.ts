import { buildBcUrl, getFilters } from '@cxbox-ui/core'
import { EMPTY_ARRAY } from '@constants'
import { RootEpic } from '../store'
import { catchError, EMPTY, filter, mergeMap, of } from 'rxjs'
import { bcFetchDataSuccess } from '@cxbox-ui/core/actions'
import { BcFilter } from '@cxbox-ui/core/interfaces'
import { setBcCount } from '@actions'

const bcFetchCountEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(bcFetchDataSuccess.match),
        mergeMap(action => {
            const state = state$.value
            const sourceWidget = state.view.widgets?.find(i => i.bcName === action.payload.bcName)

            if (!sourceWidget) {
                return EMPTY
            }

            const bcName = sourceWidget.bcName
            const filters = getFilters(state.screen.filters[bcName] || (EMPTY_ARRAY as BcFilter[]))
            const bcUrl = buildBcUrl(bcName)
            return api.fetchBcCount(bcUrl, filters).pipe(
                mergeMap(({ data }) =>
                    of(
                        setBcCount({
                            bcName,
                            count: data
                        })
                    )
                ),
                catchError(error => {
                    console.error(error)
                    return EMPTY
                })
            )
        })
    )

export const viewEpics = {
    bcFetchCountEpic
}
