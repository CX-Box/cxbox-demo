import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { useMemo } from 'react'

const events = {
    popstate: 'popstate',
    pushState: 'pushState',
    replaceState: 'replaceState',
    hashchange: 'hashChange'
} as const

const subToChangeLocationEvents = (cb: EventListener) => {
    Object.values(events).forEach(event => {
        window.addEventListener(event, cb)
    })
    return () => {
        Object.values(events).forEach(event => {
            window.removeEventListener(event, cb)
        })
    }
}

const useLocationPathname = () => useSyncExternalStore(subToChangeLocationEvents, () => window.location.pathname)
const useLocationSearch = () => useSyncExternalStore(subToChangeLocationEvents, () => window.location.search)

const navigate = (to: string, { replace = false, state = null } = {}) =>
    window.history[replace ? events.replaceState : events.pushState](state, '', to)

type ReturnType = [
    {
        pathname: string
        search: string
        params: Record<string, string>
        bcMap: Map<string, string>
        screenName?: string
        viewName?: string
    },
    typeof navigate
]

export const useBcLocation: () => ReturnType = () => {
    const pathname = useLocationPathname()
    const search = useLocationSearch()

    const params = useMemo(() => {
        const searchParams = new URLSearchParams(search)
        let obj: Record<string, string> = {}
        for (const [key, value] of searchParams) {
            obj[key] = value
        }
        return obj
    }, [search])

    const bcMap = useMemo(() => {
        let path = pathname
        if (path.startsWith('/')) {
            path = path.slice(1)
        }
        if (path.endsWith('/')) {
            path = path.slice(0, -1)
        }
        const urlArray = path.split('/').map(decodeURIComponent)
        const map = new Map<string, string>()
        for (let i = 0; i < path.length; i += 2) {
            if (urlArray[i + 1] !== undefined) {
                map.set(urlArray[i], urlArray[i + 1])
            }
        }
        return map
    }, [pathname])

    const cxBoxParams = useMemo(() => {
        return {
            pathname,
            search,
            params,
            bcMap,
            screenName: bcMap.get('screen'),
            viewName: bcMap.get('view')
        }
    }, [pathname, search, params, bcMap])

    return [cxBoxParams, navigate]
}

const patchKey = Symbol.for('cxbox_router_monkey_patch')
// <3 JS
// History API have only `popstate` event,
// proper way to listen via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
// @ts-ignore
if (typeof window.history !== 'undefined' && typeof window[patchKey] === 'undefined') {
    for (const type of [events.pushState, events.replaceState]) {
        const original = window.history[type]
        // TODO: we should use unstable_batchedUpdates to avoid multiple re-renders,
        // however that will require an additional peer dependency on react-dom.
        // See: https://github.com/reactwg/react-18/discussions/86#discussioncomment-1567149
        window.history[type] = function () {
            // @ts-ignore
            const result = original.apply(this, arguments)
            const event = new Event(type)
            // @ts-ignore
            event.arguments = arguments

            dispatchEvent(event)
            return result
        }
    }

    Object.defineProperty(window, patchKey, { value: true })
}
