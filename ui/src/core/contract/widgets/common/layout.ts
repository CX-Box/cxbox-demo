/**
 * Description of the interface for LayoutRow
 */
export interface LayoutRow {
    cols: LayoutCol[]
}

/**
 * Description of the interface for WidgetOptions's layout.rows
 */
export interface LayoutCol {
    fieldKey: string
    span?: number
}
