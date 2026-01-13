import { FIREFOX_TOOLBAR_HEIGHT } from '@constants/fileViewer'
import { CSSProperties } from 'react'

export const isFirefox = () => {
    const ua = navigator.userAgent.toLowerCase()

    if (ua.indexOf('firefox') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('safari') === -1) {
        return true
    }
}

export const supportsInlinePdfViewer = () => {
    return navigator.pdfViewerEnabled
}

export const getInlineFirefoxHideToolbarStyle = (enabled: boolean = false, height: number) => {
    if (enabled) {
        return {
            height: height + FIREFOX_TOOLBAR_HEIGHT,
            top: -FIREFOX_TOOLBAR_HEIGHT
        } as CSSProperties
    }

    return
}
