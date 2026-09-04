export const calculatePageCount = (limit: number, total: number) => {
    return Math.floor((total - 1) / limit) + 1
}

export const isPrevDisabled = (currentPage: number, pageCount: number) => {
    const hasPrev = currentPage > 1

    return !hasPrev || !pageCount
}

export const isNextDisabled = (currentPage: number, pageCount: number) => {
    const hasNext = currentPage < pageCount

    return !hasNext || !pageCount
}
