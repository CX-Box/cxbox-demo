import { Store } from '../data/Store.ts'
import { UnionState } from '../data/slices'
import { QueryClient } from '@tanstack/react-query'
import { Api } from '../data/Api.ts'

export class Forms<State extends UnionState> {
    constructor(
        protected store: Store<State>,
        protected queryClient: QueryClient,
        protected api: Api
    ) {}

    useActiveCursor() {
        // const activeCursor = this.store.useStore(state => state.activeCursor)
        // const setActiveCursor = this.store.useStore(state => state.setActiveCursor)
        // const bcForms = this.store.useStore(state => state.bcForms)
        // const initForm = this.store.useStore(state => state.initForm)
        // const destroyForm = this.store.useStore(state => state.destroyForm)
        // const queryClient = this.queryClient
        // // const screenName =
        //
        // const handleSetActiveCursor = useCallback((bcPath: string, cursor: string | null) => {
        //     setActiveCursor(bcPath, cursor)
        //     /**
        //      * TODO: make autosave flow
        //      * autosave(bcForms).then(foreach(destroy))
        //      */
        //     queryClient
        //         .ensureQueryData({
        //             queryKey: ['row-meta'],
        //             queryFn: ({ queryKey, signal }) => this.api.fetchRowMeta({ bcPath: [queryKey].join('/'), signal })
        //         })
        //         .then(res => {
        //             initForm()
        //         })
        // }, [])
    }
}
