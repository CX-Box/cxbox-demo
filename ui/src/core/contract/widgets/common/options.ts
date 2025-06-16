import { LayoutRow } from './layout.ts'
import { WidgetActions } from './actions.ts'
import { TableSettingsItem } from '../../tableSettings.ts'
import { ListFieldMeta } from '../../fields'

export interface WidgetOptions {
    layout?: {
        header?: string[]
        aside?: string[]
        rows: LayoutRow[]
    }
    actionGroups?: WidgetActions | Record<string, WidgetActions>
    /**
     * All widget fields are not editable
     */
    readOnly?: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of actionGroups
     */
    hideActionGroups?: string[]
    /**
     * Record fields which value will be used as a title for the whole record
     * for this particular widget
     */
    displayedValueKey?: string
    /**
     * Disable tooltip with error text
     */
    disableHoverError?: boolean
    /**
     * Disable notification after failed operation
     */
    disableNotification?: boolean
    /**
     * Enables filtering dates by range
     * TODO: It's a temporal option. Remove for 2.x of cxbox-ui/core
     */
    filterDateByRange?: boolean
}

type InternalWidgetOption = {
    widget: string
    style: 'inlineForm' | 'popup' | 'inline' | 'none'
}

/**
 * Description of options of allowed on table widget actions
 */
interface TableOperations {
    /**
     * Describes position of tableOperations relatively of table
     */
    position?: PositionTypes
}

/**
 * Description of possible positioning options
 */
type PositionTypes = 'Top' | 'Bottom' | 'TopAndBottom'

/**
 * Configuration descriptor for hierarchy subset of table widgets.
 *
 * Each descriptor describes a specific level of hierarchy
 */
interface WidgetTableHierarchy {
    /**
     * Which business component is displayed on this level
     */
    bcName: string
    /**
     * What record fields to use as displayed value of that record
     */
    assocValueKey?: string
    /**
     * If true only one item can be selected
     */
    radio?: boolean
    /**
     * Fields that will be displayed on this hierarchy level
     */
    fields: ListFieldMeta[]
}

type ActionCustomMode = 'default' | 'file-upload-dnd' | 'default-and-file-upload-dnd'

type ActionInfo = {
    actionKey: string
    fieldKey?: string
    mode?: ActionCustomMode | string
}

export interface ListWidgetOptions extends WidgetOptions {
    /**
     * Options for allowed on table widget actions
     */
    tableOperations?: TableOperations
    hierarchy?: WidgetTableHierarchy[]
    hierarchySameBc?: boolean
    hierarchyFull?: boolean
    hierarchyParentKey?: string
    hierarchyGroupSelection?: boolean
    hierarchyGroupDeselection?: boolean
    hierarchyTraverse?: boolean
    hierarchyRadio?: boolean
    hierarchyRadioAll?: boolean
    hierarchyDisableRoot?: boolean
    /**
     * Disable searched item descendants in fullHierarchy search
     */
    hierarchyDisableDescendants?: boolean
    hierarchyDisableParent?: boolean
    personalFields?: TableSettingsItem | null
    title?: {
        bgColor?: string
    }

    primary?: {
        enabled: boolean
        title?: string
    }

    create?: InternalWidgetOption
    edit?: InternalWidgetOption

    export?: {
        // Part of the file name, by default taken from the widget title
        title?: string
        enabled: boolean
    }

    fullTextSearch?: {
        enabled?: boolean
        placeholder?: string
    }

    additional?: {
        enabled: boolean
        fields: string[]
    }

    filterSetting?: {
        enabled: boolean
    }

    buttons?: ActionInfo[]
    pagination?: {
        hideLimitOptions?: boolean
        availableLimitsList?: number[]
        type?: 'nextAndPreviousWihHasNext' | 'nextAndPreviousSmart' | 'nextAndPreviousWithCount'
    }
}
