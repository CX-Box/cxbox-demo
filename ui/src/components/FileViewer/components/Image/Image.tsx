import React, { forwardRef, useEffect, useRef, useState } from 'react'
import styles from '@components/FileViewer/components/Image/Image.less'
import Empty from '@components/FileViewer/components/Empty/Empty'
import { Spin } from 'antd'
import { useMergeRefs } from '@hooks/useMergeRefs'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
    mode?: 'light' | 'dark'
    spinning?: boolean
}

const Image = forwardRef<HTMLImageElement, ImageProps>(({ alt, src, mode, spinning, ...restProps }, ref) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const setRefs = useMergeRefs([ref, imageRef])

    const [error, setError] = useState(false)

    useEffect(() => {
        setError(false)
    }, [src])

    return (
        <div className={styles.root}>
            {spinning && <Spin spinning={spinning} style={{ width: '100%', height: '100%' }} />}
            <img
                ref={setRefs}
                alt={alt}
                src={src}
                onError={() => setError(true)}
                {...restProps}
                style={{
                    ...restProps.style,
                    display: error || spinning ? 'none' : restProps.style?.display
                }}
            />
            {error && !spinning && <Empty type="broken" mode={mode} size="big" text={'Oops, something went wrong'} />}
        </div>
    )
})

export default Image
