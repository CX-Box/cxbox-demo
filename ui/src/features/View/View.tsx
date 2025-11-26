import React, { memo } from 'react'
import { CustomFieldTypes, CustomWidgetTypes } from '@interfaces/widget'
import MultipleSelectField from '@fields/__fields_to_migrate/MultipleSelectField/MultipleSelectField'
import styles from './View.module.css'
import Dictionary from '@fields/Dictionary/Dictionary'
import { Number } from '@fields/__fields_to_migrate/Number/Number'
import MultivalueField from '@fields/__fields_to_migrate/Multivalue/MultivalueField'
import InlinePickList from '@fields/__fields_to_migrate/InlinePickList/InlinePickList'
import FileUpload from '@fields/__fields_to_migrate/FileUpload/FileUploadContainer'
import { FieldType, interfaces } from '@cxbox-ui/core'
import TimeField from '@fields/__fields_to_migrate/TimePicker/TimePickerField'
import SuggestionPickListField from '@fields/__fields_to_migrate/SuggestionPickList/SuggestionPickList'
import FileViewerContainer from '@components/FileViewerContainer/FileViewerContainer'
import WaitUntilPopup from '@components/WaitUntilPopup/WaitUntilPopup'
import NotificationsContainer from '@components/NotificationsContainer/NotificationsContainer'
import DebugViewInfoLabel from '@components/DebugViewInfoLabel/DebugViewInfoLabel'
import { Layout } from '@features'

export const customFields = {
    [FieldType.number]: Number,
    [FieldType.percent]: Number,
    [FieldType.money]: Number,
    [FieldType.dictionary]: Dictionary,
    [FieldType.multivalue]: MultivalueField,
    [FieldType.pickList]: InlinePickList,
    [FieldType.inlinePickList]: InlinePickList,
    [CustomFieldTypes.MultipleSelect]: MultipleSelectField,
    [FieldType.fileUpload]: FileUpload,
    [CustomFieldTypes.Time]: TimeField,
    [CustomFieldTypes.SuggestionPickList]: SuggestionPickListField
}

export const customWidgets: Partial<Record<CustomWidgetTypes | interfaces.WidgetTypes, interfaces.CustomWidgetDescriptor>> = {
    // [CustomWidgetTypes.AdditionalInfo]: { component: AdditionalInfo, card: EmptyCard },
    // [CustomWidgetTypes.AdditionalList]: { component: AdditionalList, card: EmptyCard },
    // [WidgetTypes.AssocListPopup]: AssocListPopup,
    // [CustomWidgetTypes.CalendarList]: { component: CalendarList, card: null },
    // [CustomWidgetTypes.CalendarYearList]: { component: CalendarYearList, card: null },
    // [WidgetTypes.Form]: { component: Form },
    // [WidgetTypes.Info]: { component: Info },
    // [WidgetTypes.List]: { component: Table },
    // [CustomWidgetTypes.GroupingHierarchy]: { component: GroupingHierarchy },
    // [WidgetTypes.HeaderWidget]: { component: Header, card: EmptyCard },
    // [CustomWidgetTypes.Steps]: { component: Steps, card: EmptyCard },
    // [CustomWidgetTypes.Funnel]: { component: Funnel, card: DashboardCard },
    // [CustomWidgetTypes.RingProgress]: { component: RingProgress, card: DashboardCard },
    // [CustomWidgetTypes.DashboardList]: { component: DashboardList, card: DashboardCard },
    // [CustomWidgetTypes.FormPopup]: { component: FormPopup, card: null, isPopup: true },
    // [WidgetTypes.PickListPopup]: PickListPopup,
    // [WidgetTypes.SecondLevelMenu]: { component: LevelMenu, card: EmptyCard },
    // [WidgetTypes.FourthLevelMenu]: { component: LevelMenu, card: EmptyCard },
    // [CustomWidgetTypes.StatsBlock]: { component: StatsBlock, card: EmptyCard },
    // [CustomWidgetTypes.Pie1D]: { component: Chart, card: DashboardCard },
    // [CustomWidgetTypes.Column2D]: { component: Chart, card: DashboardCard },
    // [CustomWidgetTypes.Line2D]: { component: Chart, card: DashboardCard },
    // [CustomWidgetTypes.DualAxes2D]: { component: Chart, card: DashboardCard },
    // [CustomWidgetTypes.FilePreview]: { component: FilePreview, card: FilePreviewCard },
    // [WidgetTypes.ThirdLevelMenu]: { component: LevelMenu, card: EmptyCard }
}

export const View = memo(() => {
    return (
        <div className={styles.container}>
            <DebugViewInfoLabel />
            <FileViewerContainer />
            <WaitUntilPopup />
            <NotificationsContainer />
            <Layout />
        </div>
    )
})
