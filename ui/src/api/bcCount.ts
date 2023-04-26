import { buildUrl, axiosGet } from '@cxbox-ui/core'
import { BcCountParamsMap, BcCountResponse } from '../interfaces/bcCount'

export function fetchBcCount(bcName: string, params: BcCountParamsMap = {}) {
    const url = buildUrl`count/dashboard/` + bcName
    const stringParams = new URLSearchParams()
    if (params) {
        Object.keys(params).forEach(i => {
            let value = params[i]
            if (Array.isArray(value)) {
                value = `[${value.reduce((acc, cur, index) => {
                    if (!index) {
                        return acc + `"${cur}"`
                    } else {
                        return `${acc},"${cur}"`
                    }
                }, '')}]`
            }
            stringParams.set(i, value)
        })
    }
    return axiosGet<BcCountResponse>(url + (stringParams && `?${stringParams}`))
}
