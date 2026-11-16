import { MutableRefObject, RefObject, useLayoutEffect } from 'react'
import { IGraph } from '@ant-design/graphs'

export const useGraphSizeChange = (
    containerRef: RefObject<HTMLDivElement>,
    graphRef: MutableRefObject<IGraph | undefined>,
    observeContainer = false
) => {
    useLayoutEffect(() => {
        let animationFrameId: number | null = null

        const handleGraphSizeChange = () => {
            if (document.fullscreenElement) {
                return
            }

            const container = containerRef?.current
            const graph = graphRef?.current

            if (container && graph) {
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId)
                }
                animationFrameId = requestAnimationFrame(() => {
                    if (!document.fullscreenElement && containerRef.current === container && graphRef.current === graph) {
                        graph.changeSize(container.clientWidth, container.clientHeight)
                    }
                })
            }
        }

        window.addEventListener('resize', handleGraphSizeChange)
        const observer = observeContainer ? new ResizeObserver(handleGraphSizeChange) : undefined
        if (observeContainer) {
            document.addEventListener('fullscreenchange', handleGraphSizeChange)
        }
        if (containerRef.current) {
            observer?.observe(containerRef.current)
        }

        return () => {
            window.removeEventListener('resize', handleGraphSizeChange)
            document.removeEventListener('fullscreenchange', handleGraphSizeChange)
            observer?.disconnect()

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [containerRef, graphRef, observeContainer])
}
