import { EAggFunction } from '@interfaces/widget'

// todo использовать это когда будет влит 735 тикет
const getAggFunctionResult = (aggFunc: EAggFunction | undefined, values: number[]) => {
    switch (aggFunc) {
        case EAggFunction.sum:
            return values.reduce((acc, number) => acc + Number(number), 0)
        case EAggFunction.min:
            return Math.min(...values)
        case EAggFunction.max:
            return Math.max(...values)
        case EAggFunction.avg:
            return (values.reduce((acc, number) => acc + Number(number), 0) / values.length).toFixed(2)
        default:
            return null
    }
}

export default getAggFunctionResult
