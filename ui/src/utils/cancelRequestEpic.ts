import { filter, mergeMap, Observable, of, take } from 'rxjs'
import { AnyAction } from 'redux'
import { isAnyOf } from '@reduxjs/toolkit'
import { actions } from '@actions'

/**
 * Type tweak for backward @reduxjs/toolkit compatibility
 */
type TypeGuard<T> = (value: any) => value is T
interface HasMatchFunction<T> {
    match: TypeGuard<T>
}
/** @public */
type Matcher<T> = HasMatchFunction<T> | TypeGuard<T>

/**
 * Default list of action types which are triggers for request cancel
 */
export const cancelRequestActionTypes = [actions.selectView, actions.logout] as [Matcher<any>, ...Array<Matcher<any>>]

/**
 * Creator of request cancel epic
 *
 * @param action$ an observable input
 * @param actionTypes list of action types which triggers cancel
 * @param cancelFn a callback of request cancelation
 * @param cancelActionCreator an action creator which called by request cancelation
 * @param filterFn a callback function which filters come actions
 */
export function cancelRequestEpic(
    action$: Observable<AnyAction>,
    actionTypes: Parameters<typeof isAnyOf>,
    cancelFn: (() => void) | undefined,
    cancelActionCreator: AnyAction,
    filterFn: (actions: AnyAction) => boolean = item => {
        return true
    }
) {
    return action$.pipe(
        filter(isAnyOf(...actionTypes)),
        filter(filterFn),
        mergeMap(() => {
            cancelFn?.()
            return of(cancelActionCreator)
        }),
        take(1)
    )
}
