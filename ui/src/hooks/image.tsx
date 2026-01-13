import React, { useCallback, useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'

const DEFAULT_SCALE = 1
const SCALE_STEP = 0.25
const MOUSE_MOVE_DEBOUNCE_WAIT = 5

const createTransformStyle = (params?: { scale?: number; rotate?: number }) => {
    return `scale(${params?.scale}) rotate(${params?.rotate}deg)`
}

export type ImageControl = ReturnType<typeof useImageControl>

export const useImageControl = (imageRef: React.RefObject<HTMLImageElement>, enabled: boolean = false, resetTrigger?: unknown) => {
    const { mouseDown, rollback: rollbackDnd } = useImageDnd(imageRef)

    useEffect(() => {
        const imgElement = enabled ? imageRef.current : undefined

        imgElement?.addEventListener('mousedown', mouseDown)

        return () => {
            imgElement?.removeEventListener('mousedown', mouseDown)
        }
    }, [enabled, mouseDown, imageRef])

    const { rotate, rotateClockwise, rotateCounterClockwise, rollback: rollbackRotate } = useImageRotate()
    const { scale, increaseScale, decreaseScale, rollback: rollbackScale } = useImageScale(imageRef, resetTrigger)

    useEffect(() => {
        if (imageRef.current && enabled) {
            imageRef.current.style.transform = createTransformStyle({ scale: scale, rotate: rotate }) ?? ''
        }
    }, [enabled, imageRef, rotate, scale])

    const rollbackChanges = useCallback(() => {
        rollbackDnd()
        rollbackRotate()
        rollbackScale()
    }, [rollbackDnd, rollbackRotate, rollbackScale])

    useEffect(() => {
        return () => {
            rollbackChanges()
        }
    }, [rollbackChanges, resetTrigger])

    return useMemo(
        () =>
            enabled
                ? {
                      increaseScale,
                      decreaseScale,
                      scale,
                      rotate,
                      rotateClockwise,
                      rotateCounterClockwise,
                      rollbackChanges
                  }
                : undefined,
        [decreaseScale, enabled, increaseScale, rollbackChanges, rotate, rotateClockwise, rotateCounterClockwise, scale]
    )
}

const DEFAULT_ROTATE = 0
const STEP = 90

export const useImageRotate = () => {
    const [rotate, setRotate] = useState(DEFAULT_ROTATE)

    const rotateClockwise = useCallback(() => {
        setRotate(prev => {
            let next = prev + STEP
            if (next > 270) {
                next = 0
            }
            return next
        })
    }, [])

    const rotateCounterClockwise = useCallback(() => {
        setRotate(prev => {
            let next = prev - STEP
            if (next < -270) {
                next = 0
            }
            return next
        })
    }, [])

    const rollback = useCallback(() => {
        setRotate(DEFAULT_ROTATE)
    }, [])

    return {
        rotate,
        rotateClockwise,
        rotateCounterClockwise,
        rollback
    }
}

const useImageScale = (imageRef: React.RefObject<HTMLImageElement>, resetTrigger?: unknown) => {
    const [scale, setScale] = useState(DEFAULT_SCALE)

    const increaseScale = useCallback(() => {
        setScale(prev => {
            return +(prev + SCALE_STEP).toFixed(2)
        })
    }, [])

    const decreaseScale = useCallback(() => {
        setScale(prev => {
            const newValue = +(prev - SCALE_STEP).toFixed(2)

            if (newValue <= 0) {
                return prev
            }

            return newValue
        })
    }, [])

    const rollback = useCallback(() => {
        setScale(DEFAULT_SCALE)
    }, [])

    const wheelChange = useMemo(() => {
        const threshold = 3
        const timeout = 30
        let scrollCount = 0
        let timeoutId: number | undefined

        return (event: WheelEvent) => {
            event.preventDefault()

            clearTimeout(timeoutId)

            if (event.deltaY > 0 && scrollCount < 0) {
                scrollCount = 0
            } else if (event.deltaY < 0 && scrollCount > 0) {
                scrollCount = 0
            }

            if (event.deltaY > 0 && scrollCount >= 0) {
                scrollCount += 1
            } else if (event.deltaY < 0 && scrollCount <= 0) {
                scrollCount -= 1
            }

            const callback = () => (event.deltaY > 0 ? decreaseScale() : increaseScale())

            timeoutId = setTimeout(() => {
                scrollCount = 0
                callback()
                clearTimeout(timeoutId)
            }, timeout) as unknown as number

            if (Math.abs(scrollCount) >= threshold) {
                clearTimeout(timeoutId)
                callback()
                scrollCount = 0
            }
        }
    }, [decreaseScale, increaseScale])

    useEffect(() => {
        const imageElement = imageRef.current?.parentElement

        imageElement?.addEventListener('wheel', wheelChange)

        return () => {
            imageElement?.removeEventListener('wheel', wheelChange)
        }
    }, [imageRef, wheelChange, resetTrigger])

    return {
        increaseScale,
        decreaseScale,
        scale,
        rollback
    }
}

const useImageDnd = (imageRef: React.RefObject<HTMLImageElement>) => {
    const mouseDown = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            let previousClientX = 0
            let previousClientY = 0

            const mouseMove = debounce((event: MouseEvent) => {
                if (imageRef?.current) {
                    let currentClientX = event.clientX
                    let currentClientY = event.clientY

                    const newShiftX = currentClientX - previousClientX
                    const newShiftY = currentClientY - previousClientY

                    previousClientX = currentClientX
                    previousClientY = currentClientY

                    let newLeft = (Number.parseInt(imageRef.current.style.left) || 0) + newShiftX
                    let newTop = (Number.parseInt(imageRef.current.style.top) || 0) + newShiftY

                    imageRef.current.style.left = newLeft + 'px'
                    imageRef.current.style.top = newTop + 'px'
                }
            }, MOUSE_MOVE_DEBOUNCE_WAIT)

            if (imageRef?.current) {
                previousClientX = e.clientX
                previousClientY = e.clientY

                imageRef.current.style.position = 'relative'
                imageRef.current.style.cursor = 'grab'
                imageRef.current.style.userSelect = 'none'
                imageRef.current.draggable = false
                imageRef.current.style.transition = 'none'

                document.addEventListener('mousemove', mouseMove)

                imageRef.current.addEventListener('mouseup', mouseUp)
            }

            function mouseUp() {
                if (imageRef?.current) {
                    imageRef.current.style.cursor = 'auto'
                    document.removeEventListener('mousemove', mouseMove)
                    imageRef.current.removeEventListener('mouseup', mouseUp)
                    imageRef.current.style.transition = ''
                }
            }
        },
        [imageRef]
    )

    const rollback = useCallback(() => {
        if (imageRef.current) {
            imageRef.current.style.left = ''
            imageRef.current.style.top = ''
        }
    }, [imageRef])

    return {
        mouseDown,
        rollback
    }
}
