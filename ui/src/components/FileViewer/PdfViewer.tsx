import React from 'react'
import cn from 'classnames'
import styles from './FileViewer.less'

interface PdfViewerProps {
    width?: string | number
    height?: string | number
    title?: string
    src?: string
    hideToolbar?: boolean
}

function PdfViewer({ hideToolbar, ...restProps }: PdfViewerProps) {
    return (
        <div className={cn(styles.root)} style={{ height: restProps.height, width: restProps.width }}>
            <iframe
                title="pdf file"
                {...restProps}
                src={`${restProps.src}#toolbar=${hideToolbar ? 0 : 1}`}
                style={{ border: 0 }}
                height={'100%'}
            />
        </div>
    )
}

export default React.memo(PdfViewer)
