import { CustomWidgetTypes } from '@interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/core'

export const DEFAULT_PAGE_LIMIT = 5

export const AVAILABLE_LIMITS_LIST = [5, 10, 15, 20]

export const PAGINATION_MODES = {
    nextAndPreviousWithHasNext: 'nextAndPreviousWithHasNext',
    nextAndPreviousWithCount: 'nextAndPreviousWithCount',
    nextAndPreviousSmart: 'nextAndPreviousSmart'
} as const

export const AVAILABLE_PAGINATION_TYPES = [
    PAGINATION_MODES.nextAndPreviousWithHasNext,
    PAGINATION_MODES.nextAndPreviousSmart,
    PAGINATION_MODES.nextAndPreviousWithCount
] as const

export type PaginationMode = keyof typeof PAGINATION_MODES

export const MAIN_DEFAULT_PAGINATION_TYPE = PAGINATION_MODES.nextAndPreviousSmart

export const SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT = PAGINATION_MODES.nextAndPreviousWithCount

export const WIDGETS_WITH_SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT: (WidgetTypes | CustomWidgetTypes)[] = [
    WidgetTypes.List,
    CustomWidgetTypes.GroupingHierarchy,
    CustomWidgetTypes.DashboardList,
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    CustomWidgetTypes.Pie1D,
    CustomWidgetTypes.Column2D,
    CustomWidgetTypes.Line2D,
    CustomWidgetTypes.DualAxes2D
]
