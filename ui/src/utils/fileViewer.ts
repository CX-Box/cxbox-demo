export const getExtension = (fileName?: string) => {
    if (!fileName?.length) {
        return
    }

    const temp = fileName.split('/')
    const filename = temp[temp.length - 1]
    const filenameWithoutSuffix = filename.split(/#|\?/)[0]

    return /\.[^./\\]*$/.exec(filenameWithoutSuffix)?.[0]?.slice(1)
}

export const isImageExtension = (extension: string): boolean => /(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico|heic|heif)$/i.test(extension)

export const isExcelExtension = (extension: string) => {
    return /(xls|xlsx)$/i.test(extension)
}

const isWordExtension = (extension: string) => {
    return /(doc|docx)$/i.test(extension)
}

const isTextExtension = (extension: string) => {
    return /(txt)$/i.test(extension)
}

export const isPdfExtension = (extension: string) => {
    return /(pdf)$/i.test(extension)
}

export const isAudioExtension = (extension: string) => {
    return /(mp3|wav|m4a)$/i.test(extension)
}

export type FileViewerType = 'image' | 'pdf' | 'audio' | 'other' // 'excel' | 'word'

export const fileViewerType = (fileName: string = ''): FileViewerType => {
    const extension = getExtension(fileName) ?? ''

    if (isImageExtension(extension)) {
        return 'image'
    }
    if (isPdfExtension(extension)) {
        return 'pdf'
    }
    if (isAudioExtension(extension)) {
        return 'audio'
    }

    return 'other'
}

export const isAvailableFileViewing = (fileName: string = '') => {
    return fileViewerType(fileName) !== 'other'
}

export const trimString = (str?: string, maxLength: number = 54, tailLength: number = 8) => {
    const separator = '...'
    let temp
    if (str?.length && str?.length > maxLength) {
        temp = str.slice(0, maxLength - tailLength - separator.length)
        temp += separator + str.slice(str.length - tailLength, str.length)
    } else {
        temp = str
    }

    return temp
}
