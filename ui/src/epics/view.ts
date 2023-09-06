import { CustomEpic, actionTypes } from '../interfaces/actions'
import { Observable } from 'rxjs/Observable'
import { $do } from '../actions/types'
import { buildBcUrl, getFilters } from '@cxbox-ui/core'
import { fetchBcCount } from '../api/bcCount'
import { EMPTY_ARRAY } from '../constants/constants'

const bcFetchCountEpic: CustomEpic = (action$, store) =>
    action$
        .ofType(actionTypes.bcFetchDataSuccess)
        .mergeMap(action => {
            const state = store.getState()
            const sourceWidget = state.view.widgets?.find(i => i.bcName === action.payload.bcName)

            if (!sourceWidget) {
                return Observable.empty()
            }

            const bcName = sourceWidget.bcName
            const screenName = state.screen.screenName
            const filters = getFilters(state.screen.filters[bcName] || EMPTY_ARRAY)
            const bcUrl = buildBcUrl(bcName)
            return fetchBcCount(screenName, bcUrl, filters).mergeMap(({ data }) =>
                Observable.of(
                    $do.setBcCount({
                        bcName,
                        count: data
                    })
                )
            )
        })
        .catch(error => {
            console.error(error)
            return Observable.empty<never>()
        })

export const viewEpics = {
    bcFetchCountEpic
}
