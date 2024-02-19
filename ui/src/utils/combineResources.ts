import { Resource } from 'i18next'

export function combineResources(defaultDictionary: Resource, customDictionary: Resource): Resource {
    const result = { ...defaultDictionary }

    if (!customDictionary) {
        return result
    }

    Object.keys(customDictionary).forEach(code => {
        const defaultTranslation = defaultDictionary[code]?.translation as Record<string, string>
        const customTranslation = customDictionary[code].translation as Record<string, string>

        result[code] = {
            translation: {
                ...defaultTranslation,
                ...customTranslation
            }
        }
    })

    return result
}
