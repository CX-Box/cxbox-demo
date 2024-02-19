import { RootEpic } from '@store'
import { catchError, EMPTY, filter, mergeMap, of } from 'rxjs'
import { actions, utils } from '@cxbox-ui/core'
import { EMPTY_ARRAY } from '@constants'
import { setBcCount } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AxiosError } from 'axios'

const bcFetchCountEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.bcFetchDataSuccess.match),
        mergeMap(action => {
            const state = state$.value
            const sourceWidget = state.view.widgets?.find(i => i.bcName === action.payload.bcName)

            if (!sourceWidget) {
                return EMPTY
            }

            const bcName = sourceWidget.bcName
            const screenName = state.screen.screenName
            const filters = utils.getFilters(state.screen.filters[bcName] || EMPTY_ARRAY)
            const bcUrl = buildBcUrl(bcName)
            return api.fetchBcCount(screenName, bcUrl, filters).pipe(
                mergeMap(({ data }) => of(setBcCount({ bcName, count: data }))),
                catchError((error: AxiosError) => utils.createApiErrorObservable(error))
            )
        }),
        catchError(err => {
            console.error(err)
            return EMPTY
        })
    )

export const viewEpics = {
    bcFetchCountEpic
}
