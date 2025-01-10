import { catchError, concat, EMPTY, filter, mergeMap, of, switchMap } from 'rxjs'
import { OperationPreInvokeCustom, OperationPreInvokeSubType, OperationPreInvokeTypeCustom } from '@interfaces/operation'
import { interfaces, utils, ViewMetaResponse } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'
import { actions, processPreInvoke, sendOperationSuccess, showViewPopup } from '@actions'
import { RootEpic } from '@store'
import { isAnyOf } from '@reduxjs/toolkit'
import { getRouteFromString } from '@router'
import { getDefaultVisibleView } from '@components/ViewNavigation/tab/standard/utils/getDefaultVisibleView'

const findFormPopupWidget = (operationType: string, widgets: interfaces.WidgetMeta[], calleeBcName: string, widgetName?: string) => {
    const formPopupWidget = widgetName
        ? widgets.find(widget => widget.name === widgetName && widget.type === CustomWidgetTypes.FormPopup)
        : widgets.find(widget => widget.bcName === calleeBcName && widget.type === CustomWidgetTypes.FormPopup)

    if (!formPopupWidget) {
        console.info(`No popup form widget for the operation ${operationType} on bc ${calleeBcName}.`)
    }

    return formPopupWidget
}
export const processPreInvokeConfirmEpic: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(processPreInvoke.match),
        mergeMap(action => {
            const state = state$.value
            const widgets = state.view.widgets
            const { bcName, operationType, widgetName } = action.payload
            const preInvoke = action.payload.preInvoke as OperationPreInvokeCustom
            if (
                preInvoke.type === OperationPreInvokeTypeCustom.custom &&
                preInvoke.subtype === OperationPreInvokeSubType.confirmWithCustomWidget
            ) {
                const formPopupWidget = findFormPopupWidget(operationType, widgets, bcName, preInvoke.widget)

                return of(
                    formPopupWidget
                        ? showViewPopup({
                              widgetName: formPopupWidget?.name,
                              bcName: formPopupWidget?.bcName ?? bcName,
                              calleeBCName: bcName,
                              assocValueKey: operationType,
                              options: { operation: action.payload }
                          })
                        : actions.operationConfirmation({
                              operation: {
                                  bcName,
                                  operationType,
                                  widgetName
                              },
                              confirmOperation: {
                                  type: preInvoke.type,
                                  message: preInvoke.message ?? '',
                                  okText: preInvoke.yesText,
                                  cancelText: preInvoke.noText
                              }
                          })
                )
            }

            return EMPTY
        })
    )

export const replaceTemporaryIdOnSavingEpic: RootEpic = action$ =>
    action$.pipe(
        filter(isAnyOf(sendOperationSuccess, actions.bcSaveDataSuccess)),
        mergeMap(action => {
            const newCursor = action.payload.dataItem?.id
            const partPathWithId = `/${action.payload.bcName}/-1`
            const partPathWithIdRegExp = new RegExp(`${partPathWithId}$`)
            const needChangeBcPath = partPathWithIdRegExp.test(window.location.href)

            if (newCursor != null && needChangeBcPath) {
                const newPathname = window.location.hash
                    .slice(1)
                    .replace(`/${action.payload.bcName}/-1`, `/${action.payload.bcName}/${newCursor}`)

                return of(actions.changeLocation({ location: getRouteFromString(newPathname) }))
            }

            return EMPTY
        })
    )

const addFilterGroupEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.addFilterGroup.match),
        switchMap(action => {
            const newFilterGroup = action.payload

            return api.saveFilterGroup({ filterGroups: [newFilterGroup] }).pipe(
                switchMap(response =>
                    concat(
                        ...(response.data ?? []).map(({ id }) =>
                            of(
                                actions.updateIdForFilterGroup({
                                    id: id,
                                    bc: newFilterGroup.bc,
                                    name: newFilterGroup.name
                                })
                            )
                        )
                    )
                ),
                catchError(error => {
                    console.error('addFilterGroup failed')

                    return concat(
                        of(actions.removeFilterGroup({ bc: newFilterGroup.bc, name: newFilterGroup.name })),
                        utils.createApiErrorObservable(error)
                    )
                })
            )
        })
    )

const deleteFilterGroupEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.removeFilterGroup.match),
        switchMap(action => {
            const { id } = action.payload

            if (id) {
                api.deleteFilterGroup(+id)
            }

            return EMPTY
        }),
        catchError(error => {
            return utils.createApiErrorObservable(error)
        })
    )

// TODO move the modification to the kernel
export const selectScreen: RootEpic = (action$, state$) =>
    action$.pipe(
        filter(actions.selectScreen.match),
        switchMap(action => {
            const state = state$.value
            const nextViewName = state.router.viewName
            const requestedView = state.screen.views.find(item => item.name === nextViewName)
            const defaultView = !nextViewName
                ? utils.getDefaultViewForPrimary(state.screen.primaryView, state.screen.views) ??
                  utils.getDefaultViewFromPrimaries(state.screen.primaryViews, state.screen.views)
                : null
            let nextView: ViewMetaResponse | undefined | null = requestedView || defaultView

            if (!nextView) {
                const navigation = state.session.screens.find(screen => screen.name === state.screen.screenName)?.meta?.navigation
                const navigationType = navigation?.type ?? 'standard'

                if (navigationType === 'standard') {
                    const visibleViewName = getDefaultVisibleView(navigation?.menu, state.screen.views ?? [])

                    nextView = state.screen.views?.find(view => view.name === visibleViewName)

                    !nextView &&
                        console.error(
                            'Each tab navigation level must have at least one visible tab. e.g. menu/child array must have at least one element: "single view"(view without hidden=false flag) or "aggregate view" (title, child pair)'
                        )

                    nextView = nextView || state.screen.views[0]
                } else {
                    console.error(`Default view selection for navigation with type ${navigationType} not implemented`)
                    nextView = state.screen.views[0]
                }
            }

            return nextView ? of(actions.selectView(nextView)) : of(actions.selectViewFail({ viewName: nextViewName as string }))
        })
    )

export const downloadFileEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.downloadFile.match),
        mergeMap(action => {
            api.saveBlob(`${api.fileUploadEndpoint}?id=${encodeURIComponent(action.payload.fileId)}`)

            return EMPTY
        })
    )

export const downloadFileByUrlEpic: RootEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.downloadFileByUrl.match),
        mergeMap(action => {
            api.saveBlob(action.payload.url)

            return EMPTY
        })
    )

export const screenEpics = {
    replaceTemporaryIdOnSavingEpic,
    processPreInvokeConfirmEpic,
    addFilterGroupEpic,
    deleteFilterGroupEpic,
    changeScreen: selectScreen,
    downloadFileByUrlEpic,
    downloadFileEpic
}
