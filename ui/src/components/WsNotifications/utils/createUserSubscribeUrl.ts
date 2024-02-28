export const createUserSubscribeUrl = (userId: string) => {
    return `/user/${userId}/queue/websocket.reply`
}
