import getAggFunctionResult from '@utils/getAggFunctionResult'
import { Chart1DConfig } from '@interfaces/widget'
import { G2PlotDatum } from '@ant-design/plots'

export const getAggFieldValue = (data: G2PlotDatum[] | undefined, config: Chart1DConfig) => {
    if (data?.length) {
        let fieldValues = []
        const argFieldKeys = config?.total?.argFieldKeys

        if (argFieldKeys) {
            argFieldKeys.forEach(argField => fieldValues.push(...data?.map(item => item[argField])))
        } else {
            fieldValues.push(...data?.map(item => item[config?.valueFieldKey]))
        }

        const isSomeValueNaN = fieldValues?.some(item => isNaN(Number(item)))

        if (isSomeValueNaN) {
            console.info(`Error: Some field value for aggregate ${config?.valueFieldKey} contains NaN`)
            return 'NaN'
        } else {
            return (
                getAggFunctionResult(
                    config?.total?.func,
                    fieldValues.filter(item => item !== null && item !== '')
                )?.toString() || ''
            )
        }
    }
}
