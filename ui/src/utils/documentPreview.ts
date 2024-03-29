import parseDataUrlExternal from 'parse-data-url'
import { types } from 'mime-types'

export const parseDataUrl = (str: string) => {
    return parseDataUrlExternal(str)
}

export function createDataUrl(contentType: string | null, base64: string | null) {
    // data:[<mediatype>][;base64],<data>
    return `data:${contentType};base64,${base64}`
}

export const getUrlExtension = (url: string) => {
    const temp = url.split('/')
    const filename = temp[temp.length - 1]
    const filenameWithoutSuffix = filename.split(/#|\?/)[0]
    const extension = /\.[^./\\]*$/.exec(filenameWithoutSuffix)?.[0]?.slice(1)

    return extension ?? ''
}

export const isImageFileType = (type: string = ''): boolean => type.indexOf('image/') === 0

export const isImageExtension = (extension: string): boolean => /(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico|heic|heif)$/i.test(extension)

export const isImageDataUrl = (url: string): boolean => /^data:image\//.test(url)

export const isImageFileUrl = (url: string): boolean => isImageExtension(getUrlExtension(url))

export const isImageUrl = (url: string = '') => {
    return isImageFileUrl(url) || isImageDataUrl(url)
}

export const isPdfDataUrl = (url: string): boolean => /^data:application\/pdf\//.test(url)

export const isPdfFileUrl = (url: string): boolean => isPdfType(getUrlExtension(url))

export const isPdfUrl = (url: string = '') => {
    return isPdfFileUrl(url) || isPdfDataUrl(url)
}

export const isExcelType = (contentTypeOrExtension: string) => {
    return [types.xls, types.xlxs].includes(contentTypeOrExtension) || /(xls|xlsx)$/i.test(contentTypeOrExtension)
}

const isWordType = (contentTypeOrExtension: string) => {
    return [types.doc, types.docx].includes(contentTypeOrExtension) || /(doc|docx)$/i.test(contentTypeOrExtension)
}

const isTextType = (contentTypeOrExtension: string) => {
    return [types.txt].includes(contentTypeOrExtension) || /(txt)$/i.test(contentTypeOrExtension)
}

export const isPdfType = (contentTypeOrExtension: string) => {
    return [types.pdf].includes(contentTypeOrExtension) || /(pdf)$/i.test(contentTypeOrExtension)
}

export function getFileIcon(contentTypeOrExtension: string = '') {
    if (isExcelType(contentTypeOrExtension)) {
        return 'file-excel'
    } else if (isWordType(contentTypeOrExtension)) {
        return 'file-word'
    } else if (isTextType(contentTypeOrExtension)) {
        return 'file-text'
    } else if (isPdfType(contentTypeOrExtension)) {
        return 'file-pdf'
    }

    return 'file'
}

type DisplayFileType = 'image' | 'pdf' | 'excel' | 'word' | 'other'

export const getFileDisplayType = (type: string = ''): DisplayFileType => {
    if (isImageFileType(type)) {
        return 'image'
    } else if (isPdfType(type)) {
        return 'pdf'
    }

    return 'other'
}

export function getFileIconFromUrl(url: string = '') {
    let contentTypeOrExtension: string
    const parsedUrlData = parseDataUrl(url)

    if (parsedUrlData) {
        contentTypeOrExtension = parsedUrlData.contentType
    } else {
        contentTypeOrExtension = getUrlExtension(url)
    }

    return getFileIcon(contentTypeOrExtension)
}
