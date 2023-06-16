import React, { useCallback } from 'react'

type CallbackValue<S> = (prevState: S) => S
type SetRefState<S> = S | CallbackValue<S>

export function useRefState<T>(initialValue: T): [React.MutableRefObject<T>, (newValue: SetRefState<T>) => void]
export function useRefState<T>(initialValue?: T): [React.MutableRefObject<T | undefined>, (newValue: SetRefState<T | undefined>) => void]
export function useRefState<T>(initialValue: T) {
    const value = React.useRef(initialValue)
    const setValue = useCallback((newValue: SetRefState<typeof initialValue>) => {
        if (typeof newValue === 'function') {
            const callback = newValue as CallbackValue<typeof initialValue>
            value.current = callback(value.current)
        } else {
            value.current = newValue
        }
    }, [])

    return [value, setValue] as [typeof value, typeof setValue]
}
