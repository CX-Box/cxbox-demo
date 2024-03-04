import { useCallback, useState } from 'react'

export function useVisibility(defaultVisibility: boolean = false) {
    const [visible, setVisible] = useState(defaultVisibility)

    const toggleVisibility = useCallback(() => {
        setVisible(prevState => !prevState)
    }, [])

    const changeVisibility = useCallback((visible: boolean) => {
        setVisible(visible)
    }, [])

    return {
        visible,
        toggleVisibility,
        changeVisibility
    }
}
