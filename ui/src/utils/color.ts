export function getRGBFromColor(color: string) {
    const dummyElement = document.createElement('div')
    dummyElement.style.color = color
    dummyElement.style.display = 'none'

    // Adding an element to the DOM so that you can get its style
    document.body.appendChild(dummyElement)

    const computedStyle = window.getComputedStyle(dummyElement)
    const rgbString = computedStyle.color // get the color in rgb(r, g, b) оr rgba(r, g, b, a) format

    document.body.removeChild(dummyElement)

    const rgbValues = rgbString.match(/\d+/g)!.map(Number)

    return { r: rgbValues?.[0], g: rgbValues?.[1], b: rgbValues?.[2] }
}

export function calculateBrightnessYIQ({ r, g, b }: { r: number; g: number; b: number }) {
    return (r * 299 + g * 587 + b * 114) / 1000
}

export function getContrastColor(color: string) {
    return calculateBrightnessYIQ(getRGBFromColor(color)!) > 128 ? '#000000' : '#ffffff'
}

/**
 * Adds transparency to HEX color
 * @param hex Color in #RGB or #RRGGBB format
 * @param alpha Transparency (0 = fully transparent, 1 = completely opaque)
 * @returns Color in #RRGGBBAA format
 */
export function addAlphaToHex(hex: string, alpha: number): string {
    let cleanHex = hex.replace('#', '')

    if (cleanHex.length === 3) {
        cleanHex = cleanHex
            .split('')
            .map(ch => ch + ch)
            .join('')
    }

    if (cleanHex.length !== 6) {
        throw new Error('Invalid HEX format')
    }

    const clampedAlpha = Math.max(0, Math.min(1, alpha))

    const alphaHex = Math.round(clampedAlpha * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()

    return `#${cleanHex.toUpperCase()}${alphaHex}`
}
