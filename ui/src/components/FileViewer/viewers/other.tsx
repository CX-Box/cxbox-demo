import React from 'react'
import Empty from '@components/FileViewer/components/Empty/Empty'
import { getExtension } from '@utils/fileViewer'
import { ViewerDefinition } from '../core/viewerTypes'

export const other: ViewerDefinition = {
    type: 'other',
    Component: ({ fileName, url, viewerMode, view }) => {
        const isPreview = view === 'preview'

        return (
            <Empty
                type={getExtension(fileName)}
                size="big"
                mode={viewerMode}
                text={isPreview ? null : url ? 'This file type cannot be viewed' : 'There is no file in this row'}
            />
        )
    }
}
