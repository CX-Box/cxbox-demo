import { RefObject, useEffect } from 'react'

/**
 * A hook to set the value of a CSS variable.
 * Sets the variable globally (to <html>) if no ref is passed.
 * If ref is passed, sets the variable to the specified DOM element. * @param variableName.
 *
 * @param variableName - CSS variable name
 * @param value - The value to be set. If null is passed, the property will be deleted.
 * @param elementRef
 */
export const useSetCssVariable = (variableName: string, value: string | null, elementRef?: RefObject<HTMLElement>): void => {
    useEffect(() => {
        const targetElement = elementRef?.current ?? document.documentElement
        const oldValue = targetElement.style.getPropertyValue(variableName)

        if (value) {
            targetElement.style.setProperty(variableName, value)
        } else {
            targetElement.style.removeProperty(variableName)
        }

        return () => {
            if (oldValue) {
                targetElement.style.setProperty(variableName, oldValue)
            } else {
                targetElement.style.removeProperty(variableName)
            }
        }
    }, [variableName, value, elementRef])
}
