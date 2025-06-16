import { Navigation } from '../data/Navigation.ts'
import { Api } from '../data/Api.ts'
import { Store } from '../data/Store.ts'
import { AppMeta } from './AppMeta.ts'
import { Data } from './Data.ts'
import { BcTree } from './BcTree.ts'
import { UnionState } from '../data/slices'
import { RowMeta } from './RowMeta.ts'
import { ActionHandlers } from '../handlers/ActionHandlers.ts'
import { PreActionHandlers } from '../handlers/PreActionHandlers.ts'
import { QueryClient } from '@tanstack/react-query'
import { PostActionHandlers } from '../handlers/PostActionHandlers.ts'
import { Forms } from './Forms.ts'
import { WidgetMeta } from '../contract/widgets'
import { FieldMeta } from '../contract/fields'

export interface ConstructorParams<S extends UnionState> {
    api: Api
    navigation?: Navigation
    store?: Store<S>
    queryClient?: QueryClient
}

export class HooksFacade<S extends UnionState> {
    protected store: Store<S>
    protected api: Api
    protected navigation: Navigation
    protected queryClient: QueryClient

    protected Actions: ActionHandlers<S>
    protected PreActions: PreActionHandlers<S>
    protected PostActions: PostActionHandlers<S>

    protected AppMeta: AppMeta<S>
    protected Data: Data<S>
    protected BcTree: BcTree<S>
    protected RowMeta: RowMeta<S>
    protected Forms: Forms<S>

    constructor(params: ConstructorParams<S>) {
        this.api = params.api
        this.store = params.store ? params.store : new Store<S>([])
        this.navigation = params.navigation ? params.navigation : new Navigation()
        this.queryClient = params.queryClient
            ? params.queryClient
            : new QueryClient({
                  defaultOptions: {
                      queries: {
                          refetchOnWindowFocus: false
                      }
                  }
              })

        this.Actions = new ActionHandlers(this.api, this.store, this.queryClient)
        this.PreActions = new PreActionHandlers(this.store)
        this.PostActions = new PostActionHandlers(this.store, this.navigation)

        this.AppMeta = new AppMeta(this.api, this.navigation, this.store)
        this.BcTree = new BcTree(this.store)
        this.Data = new Data(this.api, this.navigation, this.queryClient, this.store, this.AppMeta, this.BcTree)
        this.RowMeta = new RowMeta(
            this.api,
            this.store,
            this.queryClient,
            this.navigation,
            this.BcTree,
            this.AppMeta,
            this.Actions,
            this.PreActions,
            this.PostActions
        )
        this.Forms = new Forms(this.store, this.queryClient, this.api)
    }

    useQueryClient() {
        return this.queryClient
    }

    useNavigate() {
        return this.navigation.navigate
    }

    useDrilldown(...args: Parameters<RowMeta<S>['useDrilldown']>) {
        return this.RowMeta.useDrilldown(...args)
    }

    useBcLocation() {
        return this.navigation.useBcLocation()
    }

    useStore<T>(selector?: (state: S) => T): T {
        return this.store.useStore(selector)
    }

    useMeta() {
        return this.AppMeta.useMeta()
    }

    useScreenMeta() {
        return this.AppMeta.useScreenMeta()
    }

    useViewMeta() {
        return this.AppMeta.useViewMeta()
    }

    useWidgetMeta(...args: Parameters<AppMeta<S>['useWidgetMeta']>) {
        return this.AppMeta.useWidgetMeta(...args)
    }

    useTypedWidgetMeta<T extends WidgetMeta>(typeGuard: (meta: WidgetMeta) => meta is T, widgetName: string) {
        return this.AppMeta.useTypedWidgetMeta<T>(typeGuard, widgetName)
    }

    useFieldMeta(...args: Parameters<AppMeta<S>['useFieldMeta']>) {
        return this.AppMeta.useFieldMeta(...args)
    }

    useTypedFieldMeta<T extends FieldMeta>(typeGuard: (meta: FieldMeta) => meta is T, widgetName: string, fieldKey: string) {
        return this.AppMeta.useTypedFieldMeta(typeGuard, widgetName, fieldKey)
    }

    useData(...args: Parameters<Data<S>['useData']>) {
        return this.Data.useData(...args)
    }

    useScreenBcPath(bcName: string) {
        return this.BcTree.useScreenBcPath(bcName)
    }

    useScreenName() {
        return this.AppMeta.useScreenName()
    }

    useViewName() {
        return this.AppMeta.useViewName()
    }

    useRowMeta(...args: Parameters<RowMeta<S>['useRowMeta']>) {
        return this.RowMeta.useRowMeta(...args)
    }

    useActions(...args: Parameters<RowMeta<S>['useActions']>) {
        return this.RowMeta.useActions(...args)
    }

    useFields(...args: Parameters<RowMeta<S>['useFields']>) {
        return this.RowMeta.useFields(...args)
    }

    useField(bcName: string, fieldKey: string) {
        return this.RowMeta.useField(bcName, fieldKey)
    }
}
