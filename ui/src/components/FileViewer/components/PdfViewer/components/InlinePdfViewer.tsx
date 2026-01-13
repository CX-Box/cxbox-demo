import React, { useRef } from 'react'
import styles from './InlinePdfViewer.less'
import { getInlineFirefoxHideToolbarStyle } from '@components/FileViewer/components/PdfViewer/utils'
import { Spin } from 'antd'
import Empty from '@components/FileViewer/components/Empty/Empty'

interface InlinePdfViewerProps {
    width: string | number
    height: string | number
    src: string
    isFirefox?: boolean
    hideToolbar?: boolean
    mode?: 'light' | 'dark'
    spinning?: boolean
}

function InlinePdfViewer({ mode, spinning, hideToolbar, isFirefox, ...restProps }: InlinePdfViewerProps) {
    const objectRef = useRef<HTMLObjectElement>(null)
    const { height, width, src } = restProps
    const toolbarFirefoxStyle = getInlineFirefoxHideToolbarStyle(isFirefox && hideToolbar && typeof height === 'number', height as number)

    return (
        <Spin className={styles.root} spinning={spinning}>
            <div
                style={{
                    position: 'relative',
                    height,
                    width,
                    ...toolbarFirefoxStyle
                }}
            >
                {src && (
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
                )}
            </div>
        </Spin>
    )
}

export default InlinePdfViewer
