export interface FieldParams {
    minRows?: number
    maxRows?: number
    editMinRows?: number
    editMaxRows?: number
}

interface DefaultValues extends Required<FieldParams> {}

export function getFieldRowsConfig(params: FieldParams, defaults: DefaultValues) {
    return {
        minRows: params.minRows ?? defaults.minRows,
        maxRows: params.maxRows ?? defaults.maxRows,
        editMinRows: params.editMinRows ?? params.minRows ?? defaults.editMinRows,
        editMaxRows: params.editMaxRows ?? params.maxRows ?? defaults.editMaxRows
    }
}
