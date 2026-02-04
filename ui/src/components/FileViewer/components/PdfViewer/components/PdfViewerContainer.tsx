import React from 'react'
import InlinePdfViewer from '@components/FileViewer/components/PdfViewer/components/InlinePdfViewer'
import { isFirefox } from '@components/FileViewer/components/PdfViewer/utils'
import PreviewPdfViewer from '@components/FileViewer/components/PdfViewer/components/PreviewPdfViewer'

interface PdfViewerContainerProps {
    displayMode?: 'inline' | 'preview'
    width: string | number
    height: string | number
    pageWidth: number
    src: string
    hideToolbar?: boolean
    mode?: 'light' | 'dark'
    spinning?: boolean
}

function PdfViewerContainer({ displayMode = 'inline', mode, pageWidth, ...inlinePdfProps }: PdfViewerContainerProps) {
    if (displayMode === 'preview') {
        return (
            <PreviewPdfViewer
                width={inlinePdfProps.width}
                height={inlinePdfProps.height}
                url={inlinePdfProps.src}
                spinning={inlinePdfProps.spinning}
            />
        )
    }
    return <InlinePdfViewer isFirefox={isFirefox()} mode={mode} {...inlinePdfProps} />
}

export default React.memo(PdfViewerContainer)
