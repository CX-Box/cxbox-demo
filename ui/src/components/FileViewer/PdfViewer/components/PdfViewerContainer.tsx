import React from 'react'
import InlinePdfViewer from '@components/FileViewer/PdfViewer/components/InlinePdfViewer'
import { isFirefox } from '@components/FileViewer/PdfViewer/utils'
import PreviewPdfViewer from '@components/FileViewer/PdfViewer/components/PreviewPdfViewer'

interface PdfViewerContainerProps {
    displayMode?: 'inline' | 'preview'
    width: number
    height: number
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
