import React, { forwardRef, RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from '@components/FileViewer/Image/Image.less'
import Empty from '@components/FileViewer/Empty/Empty'
import { Spin } from 'antd'
import { ImageControl, useImageControl } from '@hooks/image'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
    mode?: 'light' | 'dark'
    spinning?: boolean
    imageControlEnabled: boolean
    onChangeFullScreen?: () => void
}

const Image = forwardRef<ImageControl | undefined, ImageProps>(
    ({ alt, src, mode, spinning, imageControlEnabled = false, onChangeFullScreen, ...restProps }, ref) => {
        const imageRef = useRef<HTMLImageElement>(null)

        const imageControl = useImageControl(imageRef, imageControlEnabled)

        useImperativeHandle(
            ref,
            () => {
                return imageControl
            },
            [imageControl]
        )

        const { rollbackChanges } = imageControl ?? {}

        useEffect(() => {
            return () => {
                rollbackChanges?.()
            }
        }, [rollbackChanges, src])

        const [error, setError] = useState<boolean>(false)
        const divRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleError = () => {
                setError(true)
            }

            const imageElement = (imageRef as RefObject<HTMLImageElement>).current

            if (imageElement && !error) {
                imageElement.addEventListener('error', handleError)
            }

            return () => {
                imageElement?.removeEventListener('error', handleError)
            }
        }, [error, imageRef, src])

        useEffect(() => {
            return () => {
                setError(false)
            }
        }, [src])

        return (
            <div className={styles.root} ref={divRef}>
                {spinning && <Spin spinning={spinning} style={{ width: '100%', height: '100%' }} />}
                <img
                    ref={imageRef}
                    alt={alt}
                    src={src}
                    {...restProps}
                    style={{ ...restProps.style, display: !error && !spinning ? restProps.style?.display : 'none' }}
                />
                {error && !spinning && <Empty type="broken" mode={mode} size="big" text={'Oops, something went wrong'} />}
            </div>
        )
    }
)

export default Image
