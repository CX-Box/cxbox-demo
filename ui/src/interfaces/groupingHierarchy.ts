export const enum EAggFunction {
    sum = 'sum',
    min = 'min',
    max = 'max',
    avg = 'avg'
}

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
