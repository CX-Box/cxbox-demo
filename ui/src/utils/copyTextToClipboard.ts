import { notification } from 'antd'

const copyTextToClipboard = (url?: string, onSuccessMessage?: string) => {
    if (url) {
        navigator.clipboard
            ?.writeText(url)
            .then(() => {
                onSuccessMessage &&
                    notification.success({
                        message: onSuccessMessage
                    })
            })
            .catch(error => console.error(error))
    }
}

export default copyTextToClipboard
