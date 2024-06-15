export const WIDGET_TYPES = {
    Info: 'Info',
    Form: 'Form',
    List: 'List',
    DataGrid: 'DataGrid',
    AssocListPopup: 'AssocListPopup',
    PickListPopup: 'PickListPopup',
    HeaderWidget: 'HeaderWidget',
    SecondLevelMenu: 'SecondLevelMenu',
    ThirdLevelMenu: 'ThirdLevelMenu',
    FourthLevelMenu: 'FourthLevelMenu',
    WidgetCreator: 'WidgetCreator',
    Pivot: 'Pivot',
    DimFilter: 'DimFilter',
    Text: 'Text',
    FlatTree: 'FlatTree',
    FlatTreePopup: 'FlatTreePopup',
    ViewNavigation: 'ViewNavigation',
    NavigationTabs: 'NavigationTabs',
    FormPopup: 'FormPopup',
    Steps: 'Steps',
    Funnel: 'Funnel',
    RingProgress: 'RingProgress',
    DashboardList: 'DashboardList',
    AdditionalInfo: 'AdditionalInfo',
    SuggestionPickList: 'SuggestionPickList',
    StatsBlock: 'StatsBlock'
} as const

const popupWidgets = [WIDGET_TYPES.AssocListPopup, WIDGET_TYPES.PickListPopup, WIDGET_TYPES.FlatTreePopup, WIDGET_TYPES.FormPopup] as const
export const isPopupWidget = (type: string) => (popupWidgets as ReadonlyArray<string>).includes(type)

const offRegularLayoutWidets = [WIDGET_TYPES.AdditionalInfo]
export const isOffRegularLayoutWidget = (type: string) => (offRegularLayoutWidets as ReadonlyArray<string>).includes(type)
