import React from 'react'
import { Audio } from '@components/FileViewer/components/Audio/Audio'
import { ViewerDefinition } from '@components/FileViewer/core/viewerTypes'

export const audio: ViewerDefinition = {
    type: 'audio',
    Component: ({ url }) => <Audio src={url} />
}
