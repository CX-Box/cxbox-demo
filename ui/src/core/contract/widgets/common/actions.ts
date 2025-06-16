/**
 * Descriptor enabling operation on widget:
 * - string (if you just need to include / exclude action or groups)
 * - object, if this is group in which you want to selectively include or exclude the action
 */
export type ActionInclusionDescriptor =
    | string
    | {
          /**
           * Type of transaction; a string that uniquely identifies the operation on the widget
           */
          type: string
          /**
           * List of included operations or groups operations
           */
          include?: ActionInclusionDescriptor[]
          /**
           * List of excluded operations or groups operations
           */
          exclude?: string[]
      }

/**
 * Operations description in `options` of widget meta, which allows its availability.
 */
export interface WidgetActions {
    /**
     * List of included operations or groups of operations
     */
    include?: ActionInclusionDescriptor[]
    /**
     * List of excluded operations or groups of operations
     */
    exclude?: string[]
    /**
     * default no crud save action
     */
    defaultSave?: string
}
