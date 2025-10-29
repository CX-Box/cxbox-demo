import React, { useEffect, useRef } from 'react'
import { useWaveSurfer } from '@components/FileViewer/Audio/Wavesurfer.hooks'

interface Props {
    src: string
}

export const Audio: React.FC<Props> = props => {
    const waveRendererRef = useRef<HTMLDivElement>(null)
    const { isReady } = useWaveSurfer({
        container: waveRendererRef,
        url: props.src,
        height: 80,
        progressColor: '#1890ff',
        waveColor: '#bbb',
        // Set a bar width
        barWidth: 4,
        // Optionally, specify the spacing between bars
        barGap: 1,
        // And the bar radius
        barRadius: 2,
        cursorWidth: 2,
        mediaControls: true
    })

    useEffect(() => {
        if (isReady) {
            waveRendererRef.current?.children[0].shadowRoot?.querySelector('audio')?.setAttribute('controlsList', 'nodownload')
        }
    }, [isReady])

    return <div ref={waveRendererRef} />
}
