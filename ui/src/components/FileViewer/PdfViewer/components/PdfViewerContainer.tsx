import React from 'react'
import InlinePdfViewer from '@components/FileViewer/PdfViewer/components/InlinePdfViewer'
import { isFirefox } from '@components/FileViewer/PdfViewer/utils'

interface PdfViewerContainerProps {
    displayMode?: 'inline'
    width: number
    height: number
    pageWidth: number
    src: string
    hideToolbar?: boolean
    mode?: 'light' | 'dark'
}

function PdfViewerContainer({ displayMode = 'inline', mode, ...restProps }: PdfViewerContainerProps) {
    const { pageWidth, ...inlinePdfProps } = restProps

    return <InlinePdfViewer isFirefox={isFirefox()} mode={mode} {...inlinePdfProps} />
}

export default React.memo(PdfViewerContainer)
