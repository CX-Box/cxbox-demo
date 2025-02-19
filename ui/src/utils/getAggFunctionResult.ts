import { EAggFunction } from '@constants/aggregation'

const getAggFunctionResult = (aggFunc: EAggFunction | undefined, values: number[]) => {
    switch (aggFunc) {
        case EAggFunction.sum:
            return values.reduce((acc, number) => acc + Number(number), 0)
        case EAggFunction.min:
            return Math.min(...values)
        case EAggFunction.max:
            return Math.max(...values)
        case EAggFunction.avg: {
            const result = values.reduce((acc, number) => acc + Number(number), 0) / values.length

            return Math.round(result * 100) / 100
        }
        default:
            return null
    }
}

export default getAggFunctionResult
