import { RefObject, useEffect, useMemo, useState } from 'react'
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js'

const useWaveSurferInstance = (containerRef: RefObject<HTMLDivElement | null>, options: Partial<WaveSurferOptions>): WaveSurfer | null => {
    const [instance, setInstance] = useState<WaveSurfer | null>(null)

    const flatOpts = useMemo(() => Object.entries(options).flat(2), [options])

    useEffect(() => {
        if (!containerRef?.current) {
            return
        }

        const instance = WaveSurfer.create({
            container: containerRef.current,
            ...options
        })
        setInstance(instance)

        return () => {
            instance.destroy()
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [containerRef, ...flatOpts])

    return instance
}

const useWaveSurferState = (wavesurfer: WaveSurfer | null) => {
    const [isReady, setIsReady] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasFinished, setHasFinished] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    useEffect(() => {
        if (!wavesurfer) {
            return
        }

        const eventUnsubFns = [
            wavesurfer.on('load', () => {
                setIsReady(false)
                setIsPlaying(false)
                setCurrentTime(0)
            }),
            wavesurfer.on('ready', () => {
                setIsReady(true)
                setIsPlaying(false)
                setHasFinished(false)
                setCurrentTime(0)
            }),
            wavesurfer.on('finish', () => {
                setHasFinished(true)
            }),
            wavesurfer.on('play', () => {
                setIsPlaying(true)
            }),
            wavesurfer.on('pause', () => {
                setIsPlaying(false)
            }),
            wavesurfer.on('timeupdate', () => {
                setCurrentTime(wavesurfer.getCurrentTime())
            }),
            wavesurfer.on('destroy', () => {
                setIsPlaying(false)
                setIsReady(false)
            })
        ]

        return () => {
            eventUnsubFns.forEach(unsub => unsub())
        }
    }, [wavesurfer])

    return useMemo(() => ({ isReady, isPlaying, hasFinished, currentTime }), [isReady, isPlaying, hasFinished, currentTime])
}

export const useWaveSurfer = ({
    container,
    ...opts
}: Omit<WaveSurferOptions, 'container'> & { container: RefObject<HTMLDivElement | null> }) => {
    const wavesurfer = useWaveSurferInstance(container, opts)
    const state = useWaveSurferState(wavesurfer)
    return useMemo(() => ({ ...state, wavesurfer }), [state, wavesurfer])
}
