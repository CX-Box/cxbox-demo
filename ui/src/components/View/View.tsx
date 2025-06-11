import React from 'react'
import Card from '../Card/Card'
import { default as CxboxView } from './SimpleView'
import { CustomFieldTypes, CustomWidgetTypes } from '@interfaces/widget'
import MultipleSelectField from '../../fields/MultipleSelectField/MultipleSelectField'
import Form from '../widgets/Form/Form'
import Header from '../widgets/Header/Header'
import AssocListPopup from '../widgets/AssocListPopup/AssocListPopup'
import PickListPopup from '../widgets/PickListPopup/PickListPopup'
import EmptyCard from '../EmptyCard/EmptyCard'
import styles from './View.module.css'
import Info from '../widgets/Info/Info'
import Table from '../widgets/Table/Table'
import Dictionary from '../../fields/Dictionary/Dictionary'
import Steps from '../widgets/Steps/Steps'
import { DashboardLayout } from '../ui/DashboardLayout/DashboardLayout'
import Funnel from '../widgets/Funnel/Funnel'
import RingProgress from '../widgets/RingProgress/RingProgress'
import DashboardCard from '../DashboardCard/DashboardCard'
import DashboardList from '../widgets/DashboardList/DashboardList'
import LevelMenu from '../widgets/LevelMenu/LevelMenu'
import { Number } from '../../fields/Number/Number'
import { FormPopup } from '../widgets/FormPopup/FormPopup'
import MultivalueField from '../../fields/Multivalue/MultivalueField'
import InlinePickList from '../../fields/InlinePickList/InlinePickList'
import FileUpload from '../../fields/FileUpload/FileUploadContainer'
import { FieldType, interfaces } from '@cxbox-ui/core'
import { AdditionalInfoWidget } from '@components/widgets/AdditionalInfo/AdditionalInfoWidget'
import { WidgetTypes } from '@cxbox-ui/schema'
import TimeField from '../../fields/TimePicker/TimePickerField'
import SuggestionPickListField from '../../fields/SuggestionPickList/SuggestionPickList'
import { StatsBlock } from '@components/widgets/StatsBlock/StatsBlock'
import FileViewerPopup from '@components/FileViewerPopup/FileViewerPopup'
import GroupingHierarchy from '@components/widgets/GroupingHierarchy/GroupingHierarchy'
import { AdditionalListWidget } from '@components/widgets/AdditionalListWidget/AdditionalListWidget'
import WaitUntilPopup from '@components/WaitUntilPopup/WaitUntilPopup'
import NotificationsContainer from '@components/NotificationsContainer/NotificationsContainer'
import Chart from '../widgets/Chart/Chart'
import DebugViewInfoLabel from '@components/DebugViewInfoLabel/DebugViewInfoLabel'
import CardList from '@components/widgets/CardList/CardList'
import CardCarouselList from '@components/widgets/CardCarouselList/CardCarouselList'

const customFields = {
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
    [WidgetTypes.Form]: { component: Form },
    [WidgetTypes.Info]: { component: Info },
    [WidgetTypes.List]: { component: Table },
    [CustomWidgetTypes.GroupingHierarchy]: { component: GroupingHierarchy },
    [WidgetTypes.HeaderWidget]: { component: Header, card: EmptyCard },
    [CustomWidgetTypes.Steps]: { component: Steps, card: EmptyCard },
    [CustomWidgetTypes.Funnel]: { component: Funnel, card: DashboardCard },
    [CustomWidgetTypes.RingProgress]: { component: RingProgress, card: DashboardCard },
    [CustomWidgetTypes.DashboardList]: { component: DashboardList, card: DashboardCard },
    [CustomWidgetTypes.FormPopup]: { component: FormPopup, card: null },
    [CustomWidgetTypes.AdditionalInfo]: { component: AdditionalInfoWidget, card: EmptyCard },
    [CustomWidgetTypes.AdditionalList]: { component: AdditionalListWidget, card: EmptyCard },
    [WidgetTypes.AssocListPopup]: AssocListPopup,
    [WidgetTypes.PickListPopup]: PickListPopup,
    [WidgetTypes.SecondLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [WidgetTypes.ThirdLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [WidgetTypes.FourthLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [CustomWidgetTypes.StatsBlock]: { component: StatsBlock, card: EmptyCard },
    [CustomWidgetTypes.Pie1D]: { component: Chart, card: DashboardCard },
    [CustomWidgetTypes.Column2D]: { component: Chart, card: DashboardCard },
    [CustomWidgetTypes.Line2D]: { component: Chart, card: DashboardCard },
    [CustomWidgetTypes.DualAxes2D]: { component: Chart, card: DashboardCard },
    [CustomWidgetTypes.CardList]: { component: CardList },
    [CustomWidgetTypes.CardCarouselList]: { component: CardCarouselList }
}

function View() {
    return (
        <div className={styles.container}>
            <DebugViewInfoLabel />
            <FileViewerPopup />
            <WaitUntilPopup />
            <NotificationsContainer />
            <CxboxView
                customWidgets={customWidgets as Record<string, interfaces.CustomWidgetDescriptor>}
                customFields={customFields}
                card={Card as any}
                customLayout={DashboardLayout}
            />
        </div>
    )
}

export default React.memo(View)
