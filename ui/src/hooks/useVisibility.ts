import { useCallback, useState } from 'react'

export function useVisibility(defaultVisibility: boolean = false) {
    const [visibility, setVisibility] = useState(defaultVisibility)

    const toggleVisibility = useCallback(() => {
        setVisibility(prevState => !prevState)
    }, [])

    const changeVisibility = useCallback((visibility: boolean) => {
        setVisibility(visibility)
    }, [])

    return {
        visibility,
        toggleVisibility,
        changeVisibility
    }
}
