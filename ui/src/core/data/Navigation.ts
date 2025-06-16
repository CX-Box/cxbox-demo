/* eslint-disable react-hooks/rules-of-hooks */
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { useMemo } from 'react'

type NavigateFn = (to: string, params?: { replace?: boolean; state?: Record<string, never> }) => void

export class Navigation {
    private events = {
        popstate: 'popstate',
        pushState: 'pushState',
        replaceState: 'replaceState',
        hashchange: 'hashChange'
    } as const

    private subToChangeLocationEvents = (cb: EventListener) => {
        Object.values(this.events).forEach(event => {
            window.addEventListener(event, cb)
        })
        return () => {
            Object.values(this.events).forEach(event => {
                window.removeEventListener(event, cb)
            })
        }
    }

    private useLocationPathname = () => {
        return useSyncExternalStore(this.subToChangeLocationEvents, () => window.location.pathname)
    }
    private useLocationSearch = () => {
        return useSyncExternalStore(this.subToChangeLocationEvents, () => window.location.search)
    }

    public navigate: NavigateFn = (to: string, { replace = false, state = null } = {}) =>
        window.history[replace ? this.events.replaceState : this.events.pushState](state, '', to)

    constructor() {
        const patchKey = Symbol.for('cxbox_router_monkey_patch')
        // <3 JS
        // History API have only `popstate` event,
        // proper way to listen via `push/replaceState`
        // is to monkey-patch these methods.
        //
        // See https://stackoverflow.com/a/4585031
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (typeof window.history !== 'undefined' && typeof window[patchKey] === 'undefined') {
            for (const type of [this.events.pushState, this.events.replaceState]) {
                const original = window.history[type]
                // TODO: we should use unstable_batchedUpdates to avoid multiple re-renders,
                // however that will require an additional peer dependency on react-dom.
                // See: https://github.com/reactwg/react-18/discussions/86#discussioncomment-1567149
                window.history[type] = function () {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line prefer-rest-params
                    const result = original.apply<unknown>(this, arguments)
                    const event = new Event(type)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line prefer-rest-params
                    event.arguments = arguments

                    dispatchEvent(event)
                    return result
                }
            }

            Object.defineProperty(window, patchKey, { value: true })
        }
    }

    useBcLocation(): {
        params: Record<string, string>
        bcMap: Map<string, string>
        screenName: string | undefined
        viewName: string | undefined
    } {
        const pathname = this.useLocationPathname()
        const search = this.useLocationSearch()

        const params = useMemo(() => {
            const searchParams = new URLSearchParams(search)
            const obj: Record<string, string> = {}
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

        return useMemo(() => {
            return {
                pathname,
                search,
                params,
                bcMap,
                screenName: bcMap.get('screen'),
                viewName: bcMap.get('view')
            }
        }, [pathname, search, params, bcMap])
    }
}
