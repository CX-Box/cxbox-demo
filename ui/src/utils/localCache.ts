/**
 * A simple implementation of the "Observer" pattern.
 * Allows multiple observers to receive notifications about data changes.
 */
class Subject<T> {
    observers: Array<(data: T) => void>

    constructor() {
        this.observers = []
    }

    /**
     * Adds a new subscriber (observer).
     * @param observer - The callback function that will be executed upon receiving a notification.
     * @returns A function that, when called, will cancel this subscription.
     */
    subscribe(observer: (data: T) => void) {
        this.observers.push(observer)

        return () => {
            this.observers = this.observers.filter(obs => obs !== observer)
        }
    }

    /**
     * Notifies all subscribed observers by passing data to them.
     */
    notify(data: T) {
        this.observers.forEach(observer => observer(data))
    }

    /**
     * Checks if there are any active subscribers.
     */
    hasObservers() {
        return this.observers.length > 0
    }

    /**
     * Checks if there are no active subscribers.
     */
    isEmpty() {
        return !this.hasObservers()
    }
}

/**
 * Allows different parts of an application to share data and react to its changes.
 */
export class LocalCache<T> {
    private cache: Record<string, T | undefined>
    private subjects: Record<string, Subject<T | undefined>>
    private _onCleanup?: (value: T) => void
    private running: Record<string, Promise<T> | undefined>

    constructor(onCleanup?: (value: T) => void) {
        this.cache = {}
        this.subjects = {}
        this._onCleanup = onCleanup
        this.running = {}
    }

    get = (key: string) => {
        return this.cache[key]
    }

    /**
     * @important
     * Notifies subscribers only if the new value is different from the old one.
     */
    set = (key: string, valueOrFn: T | ((prev: T | undefined) => T)) => {
        const subject = this._getSubject(key)
        const oldValue = this.cache[key]
        const newValue = resolveValue(valueOrFn, oldValue)

        if (oldValue !== newValue) {
            this.cache[key] = newValue
            subject.notify(newValue)
        }
    }
    /**
     * Runs an asynchronous task for the given key.
     *
     * Behavior:
     * - If the value is already cached for `key`, returns it immediately and does not run `task`.
     * - If there is an already running task for `key`, returns the same Promise (no duplicate execution).
     * - Otherwise, runs a task and saves the result and notifying subscribers
     *
     * @param key - The cache key.
     * @param task - Lazy function that returns a Promise producing the value.
     */
    run = (key: string, task: () => Promise<T>) => {
        const cached = this.get(key)
        if (cached !== undefined) {
            return Promise.resolve(cached)
        }

        const existing = this.running[key]
        if (existing) {
            return existing
        }

        const promise = task()
            .then(value => {
                this.set(key, value)
                return value
            })
            .finally(() => {
                if (this.running[key] === promise) {
                    delete this.running[key]
                }
            })

        this.running[key] = promise
        return promise
    }

    isRunning = (key: string) => {
        return !!this.running[key]
    }

    /**
     * @private
     * Gets (or lazily creates) a `Subject` for the specified key.
     * @param key - The cache key.
     * @returns The `Subject` for the given key.
     */
    private _getSubject = (key: string) => {
        if (!this.subjects[key]) {
            this.subjects[key] = new Subject()
        }

        return this.subjects[key]
    }

    /**
     * @private
     * Attempts to clean up resources (cache and Subject) if there are no more subscribers for the given key.
     * @param key - The cache key to check and clean up.
     */
    private _tryCleanupSubject = (key: string) => {
        const subject = this.subjects[key]

        if (subject && subject.isEmpty()) {
            const value = this.cache[key]
            if (value !== undefined && this._onCleanup) {
                this._onCleanup(value)
            }

            delete this.cache[key]
            delete this.subjects[key]
        }
    }

    /**
     * Subscribe to changes of a specific key.
     *
     * @param key - The unique key for the cache entry.
     * @param callback - Function to execute when value changes.
     *
     * @returns Unsubscribe function.
     */
    subscribe(key: string, callback: (value: T | undefined) => void): () => void {
        const subject = this._getSubject(key)

        const observer = (value: T | undefined) => {
            callback(value)
        }

        const unsubscribe = subject.subscribe(observer)

        return () => {
            unsubscribe()
            this._tryCleanupSubject(key)
        }
    }
}

export const createLocalCache = <T>(onCleanup?: (value: T) => void) => new LocalCache<T>(onCleanup)

function resolveValue<T>(valueOrFn: T | ((val: T) => T), prevValue: T): T {
    if (typeof valueOrFn === 'function') {
        return (valueOrFn as (value: T) => T)(prevValue)
    }

    return valueOrFn
}
