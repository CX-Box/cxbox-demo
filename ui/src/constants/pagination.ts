import { CustomWidgetTypes } from '@interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/core'

export const DEFAULT_PAGE_LIMIT = 5

export const AVAILABLE_LIMITS_LIST = [5, 10, 15, 20]

export const AVAILABLE_PAGINATION_TYPES = ['nextAndPreviousWithHasNext', 'nextAndPreviousSmart', 'nextAndPreviousWithCount'] as const

export type PaginationMode = (typeof AVAILABLE_PAGINATION_TYPES)[number]

export const MAIN_DEFAULT_PAGINATION_TYPE: PaginationMode = 'nextAndPreviousSmart'

export const SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT: PaginationMode = 'nextAndPreviousWithCount'

export const WIDGETS_WITH_SECONDARY_DEFAULT_PAGINATION_TYPE_WITH_COUNT: (WidgetTypes | CustomWidgetTypes)[] = [
    WidgetTypes.List,
    CustomWidgetTypes.GroupingHierarchy,
    CustomWidgetTypes.DashboardList,
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    CustomWidgetTypes.Pie1D,
    CustomWidgetTypes.Column2D,
    CustomWidgetTypes.Line2D,
    CustomWidgetTypes.DualAxes2D,
    CustomWidgetTypes.CardList,
    CustomWidgetTypes.CardCarouselList
]
