import { openNotification } from '@components/NotificationsContainer/utils'

async function writeClipboardText(text: string) {
    let success = false

    try {
        await navigator.clipboard.writeText(text)
        success = true
    } catch (error: any) {
        console.error(error.message)
    }

    return success
}

async function deprecatedWriteClipboardText(text: string) {
    const textArea = document.createElement('textarea')
    textArea.style.opacity = '0'
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()

    let success = false

    try {
        success = document.execCommand('copy')
    } catch (e) {
        console.error(e)
    }

    textArea.remove()

    return success
}

const copyText = (text: string) => {
    if (navigator.clipboard) {
        return writeClipboardText(text)
    } else {
        return deprecatedWriteClipboardText(text)
    }
}

const copyTextToClipboard = (text: string, successMessage?: string) => {
    copyText(text).then(success => {
        success &&
            successMessage &&
            openNotification({
                type: 'success',
                message: successMessage
            })
    })
}

export default copyTextToClipboard
