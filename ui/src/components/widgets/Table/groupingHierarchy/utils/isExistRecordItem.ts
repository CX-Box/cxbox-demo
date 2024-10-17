export const isExistRecordItem = (item: unknown) => {
    // eslint-disable-next-line eqeqeq
    return (item != undefined && item !== '' && !Array.isArray(item)) || (Array.isArray(item) && !!item?.length)
}
