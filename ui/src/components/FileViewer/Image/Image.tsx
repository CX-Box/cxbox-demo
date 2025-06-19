import React, { useEffect, useRef, useState } from 'react'
import styles from '@components/FileViewer/Image/Image.less'
import Empty from '@components/FileViewer/Empty/Empty'
import { Spin } from 'antd'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
    mode?: 'light' | 'dark'
    spinning?: boolean
}

function Image({ alt, src, mode, spinning, ...restProps }: ImageProps) {
    const [error, setError] = useState<boolean>(false)
    const imageRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const handleError = () => {
            setError(true)
        }

        const imageElement = imageRef.current

        if (imageElement && !error) {
            imageElement.addEventListener('error', handleError)
        }

        return () => {
            imageElement?.removeEventListener('error', handleError)
        }
    }, [error, src])

    useEffect(() => {
        return () => {
            setError(false)
        }
    }, [src])

    return (
        <div className={styles.root}>
            {spinning && <Spin spinning={spinning} style={{ width: '100%', height: '100%' }} />}
            {!error && !spinning && <img ref={imageRef} alt={alt} src={src} {...restProps} />}
            {error && !spinning && <Empty type="broken" mode={mode} size="big" text={'Oops, something went wrong'} />}
        </div>
    )
}

export default Image
