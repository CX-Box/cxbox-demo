import { notification } from 'antd'

const copyTextToClipboard = (url: string, onSuccessMessage?: string) => {
    const textArea = document.createElement('textarea')
    textArea.style.opacity = '0'
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()

    try {
        const success = document.execCommand('copy')
        success && onSuccessMessage && notification.success({ message: onSuccessMessage })
    } catch (e) {
        console.error(e)
    }
    textArea.remove()
}

export default copyTextToClipboard
