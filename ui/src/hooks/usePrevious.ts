import React from 'react'
import { useRefState } from './useRefState'

export function usePrevious<T>(currentValue?: T) {
    const [value, setValue] = useRefState()
    React.useEffect(() => {
        setValue(currentValue)
    })
    return value.current
}
