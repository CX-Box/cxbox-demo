import { DrillDownType } from '@cxbox-ui/core'

const externalDrillDownTypes = [DrillDownType.external, DrillDownType.externalNew]

const getFullUrl = (url?: string, type?: DrillDownType) => {
    if (url && type) {
        if (externalDrillDownTypes.includes(type)) {
            return url
        }

        let relativeUrl = url.startsWith('/') ? url.substring(1) : url
        relativeUrl = type === DrillDownType.inner ? `#/${relativeUrl}` : relativeUrl

        return `${window.location.origin}/${relativeUrl}`
    }
    return null
}

export default getFullUrl
