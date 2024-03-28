import { useEffect, useState } from 'react'
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'
import { PageViewport } from 'pdfjs-dist'

function asyncMap<T, U>(arr: T[], fn: (cur: T, idx: number, arr: T[]) => Promise<U>): Promise<U[]> {
    return new Promise((resolve, reject) => {
        Promise.all(arr.map(fn)).then(resolve).catch(reject)
    })
}

export const usePageViewports = (pageWidth: number) => {
    const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
    const [pageViewports, setPageViewports] = useState<PageViewport[] | null>(null)

    /**
     * React-Window cannot get item size using async getter, therefore we need to
     * calculate them ahead of time.
     */
    useEffect(() => {
        setPageViewports(null)

        if (!document) {
            return
        }

        ;(async () => {
            const pageNumbers = Array.from(Array(document.numPages).keys(), index => index + 1)

            const nextPageViewports = await asyncMap(pageNumbers, pageNumber =>
                document.getPage(pageNumber).then(page => page.getViewport({ scale: 1 }))
            )

            setPageViewports(nextPageViewports)
        })()
    }, [document])

    const getPageHeight = (pageIndex: number) => {
        if (!pageViewports) {
            throw new Error('getPageHeight() called too early')
        }
        const pageViewport = pageViewports[pageIndex]
        const scale = pageWidth / pageViewport.width

        return pageViewport.height * scale + 1
    }

    return {
        document,
        getPageHeight,
        pageWidth,
        changeDocument: setDocument,
        numberOfPages: document && pageViewports ? document.numPages : 0
    }
}
