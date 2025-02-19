import { EAggFunction } from '@constants/aggregation'

export interface IAggField {
    fieldKey: string
    func: EAggFunction
    argFieldKeys?: string[]
    description?: string
}

export interface IAggLevel {
    level: number
    aggFields: IAggField[]
}
