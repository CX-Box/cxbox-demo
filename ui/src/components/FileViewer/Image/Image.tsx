import React, { useEffect, useRef, useState } from 'react'
import styles from '@components/FileViewer/Image/Image.less'
import Empty from '@components/FileViewer/Empty/Empty'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
    mode?: 'light' | 'dark'
}

function Image({ alt, src, mode, ...restProps }: ImageProps) {
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
            {!error && <img ref={imageRef} alt={alt} src={src} {...restProps} />}
            {error && <Empty type="brokenFile" mode={mode} size="big" text={'Oops, something went wrong'} />}
        </div>
    )
}

export default Image
