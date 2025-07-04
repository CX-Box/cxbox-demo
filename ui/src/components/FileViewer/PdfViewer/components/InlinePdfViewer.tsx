import React, { useEffect, useRef, useState } from 'react'
import styles from './InlinePdfViewer.less'
import { getInlineFirefoxHideToolbarStyle } from '@components/FileViewer/PdfViewer/utils'
import { Spin } from 'antd'
import Empty from '@components/FileViewer/Empty/Empty'

interface InlinePdfViewerProps {
    width: string | number
    height: string | number
    src: string
    isFirefox?: boolean
    hideToolbar?: boolean
    mode?: 'light' | 'dark'
}

function InlinePdfViewer({ mode, hideToolbar, isFirefox, ...restProps }: InlinePdfViewerProps) {
    const [loading, setLoading] = useState<boolean>(false)
    const objectRef = useRef<HTMLObjectElement>(null)
    const { height, width, src } = restProps
    const toolbarFirefoxStyle = getInlineFirefoxHideToolbarStyle(isFirefox && hideToolbar && typeof height === 'number', height as number)

    useEffect(() => {
        const objectElement = objectRef.current
        const handleLoad = () => {
            setLoading(false)

            objectElement?.removeEventListener('load', handleLoad)
            objectElement?.removeEventListener('error', handleLoad)
        }

        if (src) {
            setLoading(true)

            objectElement?.addEventListener('load', handleLoad)
            objectElement?.addEventListener('error', handleLoad)
        }

        return () => {
            objectElement?.removeEventListener('load', handleLoad)
            objectElement?.removeEventListener('error', handleLoad)
        }
    }, [src])

    return (
        <Spin className={styles.root} spinning={loading}>
            <div
                style={{
                    position: 'relative',
                    height,
                    width,
                    ...toolbarFirefoxStyle
                }}
            >
                <object
                    key={src}
                    ref={objectRef}
                    title="pdf viewer"
                    {...restProps}
                    data={`${src}#toolbar=${hideToolbar ? 0 : 1}`}
                    style={{ border: 0 }}
                    height={'100%'}
                >
                    <Empty type="broken" mode={mode} size="big" text={'Oops, something went wrong'} />
                </object>
            </div>
        </Spin>
    )
}

export default InlinePdfViewer
