// Is the top edge of the element visible?
export const isElementTopVisible = (coords: DOMRect, windowHeight: number) => {
    return coords.top > 0 && coords.top < windowHeight
}

// Is the bottom edge of the element visible?
export const isElementBottomVisible = (coords: DOMRect, windowHeight: number) => {
    return coords.bottom < windowHeight && coords.bottom > 0
}

export const isVisibleElement = (element: Element) => {
    const coords = element.getBoundingClientRect()
    const windowHeight = document.documentElement.clientHeight

    return isElementTopVisible(coords, windowHeight) || isElementBottomVisible(coords, windowHeight)
}

export const isFullVisibleElement = (element: Element) => {
    const coords = element.getBoundingClientRect()
    const windowHeight = document.documentElement.clientHeight

    return isElementTopVisible(coords, windowHeight) && isElementBottomVisible(coords, windowHeight)
}
