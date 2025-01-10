import { catchError, EMPTY, filter, map, mergeMap, of, switchMap } from 'rxjs'
import { RootEpic } from '@store'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import processDrillDownInNewTab from './utils/processDrillDownInNewTab'

const drillDownInNewTabChangeCursorsEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(actions.drillDownInNewTab.match),
        map(action => {
            const state = state$.value
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName)
            const bcName = widget?.bcName as string
            const cursor = state.screen.bo.bc[bcName]?.cursor

            if (cursor !== action.payload.cursor) {
                return actions.bcChangeCursors({ cursorsMap: { [bcName]: action.payload.cursor } })
            }

            return actions.emptyAction
        })
    )

const drillDownInNewTabEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.drillDownInNewTab.match),
        switchMap(action => {
            const state = state$.value
            const { widgetName, fieldKey, cursor, copyLink } = action.payload

            const bcName = state.view.widgets.find(item => item.name === widgetName)?.bcName as string
            const bcUrl = buildBcUrl(bcName, true)
            const rowMeta = state.view.rowMeta[bcName]?.[bcUrl]

            if (rowMeta) {
                processDrillDownInNewTab(state, rowMeta, fieldKey, cursor, bcName, copyLink)
                return EMPTY
            }

            return api.fetchRowMeta(state.screen.screenName, bcUrl).pipe(
                mergeMap(rowMeta => {
                    processDrillDownInNewTab(state, rowMeta, fieldKey, cursor, bcName, copyLink)
                    return of(actions.bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                }),
                catchError(err => {
                    console.error(err)
                    return EMPTY
                })
            )
        })
    )

export const routerEpics = {
    drillDownInNewTabChangeCursorsEpic,
    drillDownInNewTabEpic
}
