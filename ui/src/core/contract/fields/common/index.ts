export type FieldBaseRecord = object

export interface FieldMeta extends FieldBaseRecord {
    type: string
    key: string
    drillDown?: boolean
    bgColor?: string
    bgColorKey?: string
    snapshotKey?: string
    /**
     * Maximum number of characters
     */
    maxInput?: number
    /**
     * Whether the fields is hidden
     */
    hidden?: boolean
    drillDownKey?: string
    /**
     * When assigned with another fields key, this another will be used for filtration purposes
     */
    filterBy?: string
}

export function isField(field: FieldBaseRecord): field is FieldMeta {
    return 'type' in field && 'key' in field
}

/**
 * Description of the list of fields of block type.
 *
 * Used to create a block grouping of fields
 */
export interface FieldBlock<T extends FieldMeta> extends FieldBaseRecord {
    /**
     * Block ID
     */
    blockId: number
    /**
     * Name of the block
     */
    name: string
    /**
     * Fields contained in the block
     */
    fields: T[]
}

export function isFieldBlock<T extends FieldMeta>(field: FieldBaseRecord): field is FieldBlock<T> {
    return typeof field === 'object' && field !== null && 'fields' in field
}

export interface ListFieldMeta extends FieldMeta {
    title: string
    width?: number
    /**
     * Width (px) to be set for the field when exporting to Excel
     */
    excelWidth?: number
}

export interface FormFieldMeta extends FieldMeta {
    label: string
}

export interface InfoFieldMeta extends FormFieldMeta {
    label: string
    drillDownTitle?: string
    drillDownTitleKey?: string
    hintKey?: string
}
