import React from 'react'
import Image from '../components/Image/Image'
import { ViewerDefinition } from '../core/viewerTypes'

export const image: ViewerDefinition = {
    type: 'image',
    Component: ({ viewerRef, alt, url, loading, viewerMode }) => {
        return <Image ref={viewerRef} alt={alt} src={url} mode={viewerMode} spinning={loading} />
    }
}
