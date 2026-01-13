import React from 'react'
import { PdfViewer } from '@components/FileViewer/components/PdfViewer'
import { ViewerDefinition, ViewType } from '../core/viewerTypes'

const viewWithHiddenToolbar: ViewType[] = ['compact', 'preview']

export const pdf: ViewerDefinition = {
    type: 'pdf',
    Component: ({ view, url, width, height, pageWidth, viewerMode, loading }) => {
        const isPreview = view === 'preview'

        return (
            <PdfViewer
                displayMode={isPreview ? 'preview' : 'inline'}
                src={url}
                width={width}
                height={height}
                hideToolbar={viewWithHiddenToolbar.includes(view)}
                mode={viewerMode}
                pageWidth={pageWidth}
                spinning={loading}
            />
        )
    }
}
