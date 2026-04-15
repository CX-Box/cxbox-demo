import { MutableRefObject, RefObject, useLayoutEffect } from 'react'
import { IGraph } from '@ant-design/graphs'

export const useGraphSizeChange = (containerRef: RefObject<HTMLDivElement>, graphRef: MutableRefObject<IGraph | undefined>) => {
    useLayoutEffect(() => {
        let animationFrameId: number | null = null

        const handleGraphSizeChange = () => {
            if (document.fullscreenElement) {
                return
            }

            const container = containerRef?.current
            const graph = graphRef?.current

            if (container && graph) {
                animationFrameId = requestAnimationFrame(() => {
                    graph.changeSize(container.clientWidth, container.clientHeight)
                })
            }
        }

        window.addEventListener('resize', handleGraphSizeChange)

        return () => {
            window.removeEventListener('resize', handleGraphSizeChange)

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [containerRef, graphRef])
}
