class Subject<T extends unknown> {
    observers: Array<(data: T) => void>

    constructor() {
        this.observers = []
    }

    subscribe(observer: (data: T) => void) {
        this.observers.push(observer)

        return () => {
            this.observers.filter(obs => obs !== observer)
        }
    }

    notify(data: T) {
        this.observers.forEach(observer => observer(data))
    }

    hasObservers() {
        return this.observers.length > 0
    }
}

export class LocalCache<T> {
    cache: Record<string, T | undefined>
    observers: Record<string, Subject<T>>

    constructor() {
        this.cache = {}
        this.observers = {}
    }

    create(key: string, callback: (value: T | undefined, set: (value: T) => void) => (() => void) | void) {
        let unsubscribe: () => void | undefined

        const callbackClear = callback(this.cache[key], (value: T) => {
            if (!this.observers[key]) {
                this.observers[key] = new Subject()
            }

            this.cache[key] = value
            this.observers[key].notify(value)

            unsubscribe = this.observers[key].subscribe((value: T) =>
                callback(value, value => {
                    this.cache[key] = value
                })
            )
        })

        return () => {
            unsubscribe?.()
            callbackClear?.()

            if (this.observers[key] && !this.observers[key].hasObservers()) {
                delete this.cache[key]
                delete this.observers[key]
            }
        }
    }
}

export const createLocalCache = <T>() => new LocalCache<T>()
