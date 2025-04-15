function checkVisibilityOld(element: HTMLElement, { checkOpacity = false, checkVisibilityCSS = false }: CheckVisibilityOptions = {}) {
    const style = getComputedStyle(element)

    if (checkVisibilityCSS && ['hidden', 'collapse'].includes(style.visibility)) {
        return false
    }

    if (checkOpacity && parseFloat(style.opacity) === 0) {
        return false
    }

    const notHiddenByCSS = style.display !== 'none' && style.display !== 'contents'
    const notHiddenAttribute = !element.hidden
    const hasDimensions = element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0

    return notHiddenByCSS && notHiddenAttribute && hasDimensions
}

if (!HTMLElement.prototype.checkVisibility) {
    HTMLElement.prototype.checkVisibility = function (options) {
        return checkVisibilityOld(this, options)
    }
}
