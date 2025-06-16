/* eslint-disable react-hooks/rules-of-hooks */
import { Api } from '../data/Api.ts'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Navigation } from '../data/Navigation.ts'
import { Store } from '../data/Store.ts'
import { UnionState } from '../data/slices'
import { AppMetaResponse } from '../contract/appMeta.ts'
import { FieldMeta, isField, isFieldBlock } from '../contract/fields'
import { WidgetMeta } from '../contract/widgets'

export class AppMeta<State extends UnionState> {
    constructor(
        protected api: Api,
        protected navigation: Navigation,
        protected store: Store<State>
    ) {}

    useMeta<TData = AppMetaResponse>(select?: (data: AppMetaResponse) => TData) {
        return useQuery({
            queryKey: ['meta'],
            queryFn: ({ signal }) => this.api.loginByRoleRequest({ signal, role: '' }),
            staleTime: Infinity,
            select: select
        })
    }

    private screenSelector = (data: AppMetaResponse, screenName?: string) => {
        return (
            data?.screens.find(screen => screen.name === screenName) ||
            data?.screens.find(screen => screen.defaultScreen) ||
            data?.screens[0]
        )
    }

    useScreenMeta() {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                return this.screenSelector(data, bcLocation?.screenName)
            },
            [bcLocation.screenName]
        )

        return this.useMeta(selector)
    }

    useScreenName() {
        const { data } = this.useScreenMeta()
        return data?.name || ''
    }

    private viewSelector = (data: AppMetaResponse, screenName?: string, viewName?: string) => {
        const screen = this.screenSelector(data, screenName)
        return (
            screen?.meta?.views.find(view => view.name === viewName) ||
            screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
            screen?.meta?.views[0]
        )
    }

    useViewMeta() {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                return this.viewSelector(data, bcLocation.screenName, bcLocation.viewName)
            },
            [bcLocation.screenName, bcLocation.viewName]
        )

        return this.useMeta(selector)
    }

    useViewName() {
        const { data } = this.useViewMeta()
        return data?.name || ''
    }

    private widgetSelector(data: AppMetaResponse, screenName?: string, viewName?: string, widgetName?: string) {
        const view = this.viewSelector(data, screenName, viewName)
        return view?.widgets.find(widget => widget.name === widgetName)
    }

    useWidgetMetaWithSelector<TData = AppMetaResponse>(selector?: (data: AppMetaResponse) => TData) {
        return this.useMeta(selector)
    }

    useWidgetMeta(widgetName: string) {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                return this.widgetSelector(data, bcLocation.screenName, bcLocation.viewName, widgetName)
            },
            [bcLocation.screenName, bcLocation.viewName, widgetName]
        )
        return this.useWidgetMetaWithSelector(selector)
    }

    useTypedWidgetMeta<T extends WidgetMeta>(typeGuard: (meta: WidgetMeta) => meta is T, widgetName: string) {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                const widget = this.widgetSelector(data, bcLocation.screenName, bcLocation.viewName, widgetName)
                if (widget && typeGuard(widget)) {
                    return widget
                }
            },
            [bcLocation.screenName, bcLocation.viewName, typeGuard, widgetName]
        )
        return this.useWidgetMetaWithSelector(selector)
    }

    private fieldSelector = (data: AppMetaResponse, screenName?: string, viewName?: string, widgetName?: string, fieldKey?: string) => {
        const widget = this.widgetSelector(data, screenName, viewName, widgetName)
        let field
        if (widget) {
            for (const fieldLike of widget.fields) {
                if (isField(fieldLike)) {
                    if (fieldLike.key === fieldKey) field = fieldLike
                }
                if (isFieldBlock(fieldLike)) {
                    for (const blockField of fieldLike.fields) {
                        if (blockField.key === fieldKey) field = blockField
                    }
                }
            }
        }
        return field
    }

    useFieldMetaWithSelector<TData = AppMetaResponse>(selector: (data: AppMetaResponse) => TData) {
        return this.useMeta(selector)
    }

    useFieldMeta(widgetName: string, fieldName: string) {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                return this.fieldSelector(data, bcLocation.screenName, bcLocation.viewName, widgetName, fieldName)
            },
            [bcLocation.screenName, bcLocation.viewName, fieldName, widgetName]
        )
        return this.useFieldMetaWithSelector(selector)
    }

    useTypedFieldMeta<T extends FieldMeta>(typeGuard: (meta: FieldMeta) => meta is T, widgetName: string, fieldKey: string) {
        const bcLocation = this.navigation.useBcLocation()
        const selector = useCallback(
            (data: AppMetaResponse) => {
                const field = this.fieldSelector(data, bcLocation.screenName, bcLocation.viewName, widgetName, fieldKey)
                if (field && typeGuard(field)) {
                    return field
                }
            },
            [bcLocation.screenName, bcLocation.viewName, fieldKey, typeGuard, widgetName]
        )
        return this.useFieldMetaWithSelector(selector)
    }
}
