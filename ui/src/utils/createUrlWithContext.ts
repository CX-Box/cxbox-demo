export const createUrlWithContext = (urlWithoutBcPath: string, contextBcPath?: string) => {
    return urlWithoutBcPath + (contextBcPath ? `/${contextBcPath}` : '')
}
