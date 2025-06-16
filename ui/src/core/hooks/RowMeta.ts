/* eslint-disable react-hooks/rules-of-hooks */
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { BcTree } from './BcTree.ts'
import { UnionState } from '../data/slices'
import { AppMeta } from './AppMeta.ts'
import { Api } from '../data/Api.ts'
import { ActionHandlers } from '../handlers/ActionHandlers.ts'
import { useCallback } from 'react'
import { PreActionHandlers } from '../handlers/PreActionHandlers.ts'
import { PostActionHandlers } from '../handlers/PostActionHandlers.ts'
import { isRowMetaResponse, RowMetaResponse } from '../contract/rowMeta.ts'
import { Navigation } from '../data/Navigation.ts'
import { Store } from '../data/Store.ts'
import { isAction, isActionGroup } from '../contract/actions'
import { isDataItemResponse, isDataValueString } from '../contract/data'
import { isApiDataResponse } from '../contract/common'

export class RowMeta<S extends UnionState> {
    constructor(
        protected api: Api,
        protected store: Store<S>,
        protected queryClient: QueryClient,
        protected navigation: Navigation,
        protected BcTree: BcTree<S>,
        protected AppMeta: AppMeta<S>,
        protected Action: ActionHandlers<S>,
        protected PreAction: PreActionHandlers<S>,
        protected PostAction: PostActionHandlers<S>
    ) {}

    useRowMetaWithSelector<TData = RowMetaResponse>(bcName: string, force?: boolean, selector?: (data: RowMetaResponse) => TData) {
        const { thisBcPath, cursor } = this.BcTree.useScreenBcPath(bcName)
        const screenName = this.AppMeta.useScreenName()
        const metaPath = [thisBcPath, cursor].join('/')

        const enabled = cursor !== null || force

        return useQuery({
            queryKey: ['row-meta', screenName, metaPath],
            queryFn: ({ signal, queryKey }) => {
                return this.api.fetchRowMeta({ signal, bcPath: queryKey.join('/') })
            },
            enabled: enabled,
            refetchOnMount: false,
            select: selector,
            gcTime: 0
        })
    }

    /**
     * React-query хук для загрузки роу-меты, в большинстве случаев нужен для работы с actions и формами
     * @param bcName имя бизнес-компонента в дереве
     * @param force параметр заставляющий брать данные из кэша, нужен для оптимизации запросов от динамических полей или принудительно грузить данные
     */
    useRowMeta(bcName: string, force?: boolean) {
        return this.useRowMetaWithSelector(bcName, force)
    }

    private actionsSelector(data: RowMetaResponse) {
        return data.data.row.actions
            .map(action => {
                if (isAction(action)) {
                    return action
                }
                if (isActionGroup(action)) {
                    return action
                }
            })
            .filter(action => action !== undefined)
    }

    useActions(bcName: string, forceLoad?: boolean) {
        const screenName = this.AppMeta.useScreenName()
        const actions = this.useRowMetaWithSelector(bcName, forceLoad, this.actionsSelector)
        const { thisBcPath, cursor, setCursor } = this.BcTree.useScreenBcPath(bcName)
        const getPreAction = this.PreAction.getPreAction
        const getAction = this.Action.getAction
        const getPostAction = this.PostAction.getPostAction

        const performActionFn = useCallback(
            async (type: string) => {
                const findAction = () => {
                    for (const actionOrGroup of actions.data || []) {
                        if (isActionGroup(actionOrGroup)) {
                            for (const action of actionOrGroup.actions) {
                                if (action.type === type) {
                                    return action
                                }
                            }
                        } else {
                            if (isAction(actionOrGroup) && actionOrGroup.type === type) {
                                return actionOrGroup
                            }
                        }
                    }
                }

                const action = findAction()
                try {
                    if (action?.preInvoke) {
                        await getPreAction(action.preInvoke.type)(action.preInvoke)
                    }
                    if (action?.type) {
                        return await getAction(action.type)({ action: action, bcName, bcPath: thisBcPath, screenName, cursor })
                    }
                } catch (e) {
                    console.error(e)
                }
            },
            [actions, bcName, cursor, getAction, getPreAction, screenName, thisBcPath]
        )

        const mutation = useMutation({
            mutationFn: performActionFn,
            onSuccess: async data => {
                if (data && isApiDataResponse(data)) {
                    if (isRowMetaResponse(data)) {
                        const rowMetaCursor = data.data.row.fields.find(field => field.key === 'id')?.currentValue as string
                        setCursor(rowMetaCursor)
                        /**
                         * fetchQuery вместо setQueryData из-за того, что все запросы row-meta завязаны на курсоры.
                         * Имитация запроса дает возможность сменить курсоры, включая свой, не запрашивая эту мету.
                         * Все остальные запросятся, как должны.
                         */
                        await this.queryClient.fetchQuery({
                            queryKey: ['row-meta', screenName, `${thisBcPath}/${rowMetaCursor}`],
                            queryFn: () => new Promise(resolve => resolve(data))
                        })
                    } else {
                        if (cursor) {
                            setCursor(cursor)
                        }
                        await this.queryClient.invalidateQueries({
                            queryKey: ['row-meta', screenName, `${thisBcPath}/${cursor}`]
                        })
                    }
                    if (isRowMetaResponse(data) || isDataItemResponse(data)) {
                        data.data.postActions?.forEach(postAction => {
                            getPostAction(postAction.type)(postAction)
                        })
                    }
                }
            }
        })

        return { actions, mutation }
    }

    private fieldsSelector(data: RowMetaResponse) {
        return data.data.row.fields
    }

    useFields(bcName: string) {
        return this.useRowMetaWithSelector(bcName, undefined, this.fieldsSelector)
    }

    private fieldSelector(data: RowMetaResponse, fieldName: string) {
        return this.fieldsSelector(data).find(field => field.key === fieldName)
    }

    useField(bcName: string, fieldKey: string) {
        const selector = useCallback(
            (data: RowMetaResponse) => {
                return this.fieldSelector(data, fieldKey)
            },
            [fieldKey]
        )

        return this.useRowMetaWithSelector(bcName, undefined, selector)
    }

    useDrilldown(bcName: string, fieldKey: string, id: string) {
        const screenName = this.AppMeta.useScreenName()
        const { setCursor, thisBcPath } = this.BcTree.useScreenBcPath(bcName)
        const navigate = this.navigation.navigate

        return useCallback(() => {
            this.queryClient
                .ensureQueryData({
                    queryKey: ['row-meta', screenName, [thisBcPath, id].join('/')],
                    queryFn: ({ queryKey, signal }) => {
                        return this.api.fetchRowMeta({ bcPath: queryKey.join('/'), signal })
                    }
                })
                .then(rowMeta => {
                    const fieldMeta = rowMeta?.data.row.fields.find(field => field.key === fieldKey)
                    if (fieldMeta?.drillDownType === 'inner' && fieldMeta.drillDown) {
                        const rowMetaField = rowMeta.data.row.fields.find(field => field.key === 'id')
                        if (rowMetaField && isDataValueString(rowMetaField.currentValue)) {
                            setCursor(rowMetaField.currentValue)
                        }
                        navigate(fieldMeta.drillDown)
                    }
                })
        }, [fieldKey, id, navigate, screenName, setCursor, thisBcPath])
    }
}
