const openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank')
    newWindow && (newWindow.opener = null)
}

export default openInNewTab
