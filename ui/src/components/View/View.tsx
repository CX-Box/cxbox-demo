import React from 'react'
import Card from '../Card/Card'
import { View as CxboxView } from '@cxboxComponents'
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
import { Number } from '../../fields/NumberInput/NumberInput'
import { FormPopup } from '../widgets/FormPopup/FormPopup'
import MultivalueField from '../../fields/Multivalue/MultivalueField'
import InlinePickList from '../../fields/InlinePickList/InlinePickList'
import PickListField from '../../fields/PickListField/PickListField'
import { useAppSelector } from '@store'
import ViewInfoLabel from '../DebugPanel/components/ViewInfoLabel'
import PopupWidgetInfoLabel from '../DebugPanel/components/PopupWidgetInfoLabel'
import FileUpload from '../../fields/FileUpload/FileUploadContainer'
import { interfaces } from '@cxbox-ui/core'
import { AdditionalInfoWidget } from '@components/widgets/AdditionalInfo/AdditionalInfoWidget'
import { WidgetTypes } from '@cxbox-ui/schema'
import TimeField from '../../fields/TimePicker/TimePickerField'
import SuggestionPickListField from '../../fields/SuggestionPickList/SuggestionPickList'
import { StatsBlock } from '@components/widgets/StatsBlock/StatsBlock'
import FileViewerPopup from '@components/FileViewerPopup/FileViewerPopup'
import GroupingHierarchy from '@components/widgets/GroupingHierarchy/GroupingHierarchy'

// TODO We need to remove PopupWidgetTypes from the core and replace imports throughout the entire project
const { PopupWidgetTypes, FieldType } = interfaces

const customPopupWidgetTypes: CustomWidgetTypes[] = [CustomWidgetTypes.FormPopup]

const allPopupWidgetTypes: string[] = [...customPopupWidgetTypes, ...PopupWidgetTypes]

const skipWidgetTypes: (WidgetTypes | CustomWidgetTypes)[] = [CustomWidgetTypes.AdditionalInfo]

const customFields = {
    [FieldType.number]: Number,
    [FieldType.percent]: Number,
    [FieldType.money]: Number,
    [FieldType.dictionary]: Dictionary,
    [FieldType.multivalue]: MultivalueField,
    [FieldType.pickList]: PickListField,
    [FieldType.inlinePickList]: InlinePickList,
    [CustomFieldTypes.MultipleSelect]: MultipleSelectField,
    [FieldType.fileUpload]: FileUpload,
    [CustomFieldTypes.Time]: TimeField,
    [CustomFieldTypes.SuggestionPickList]: SuggestionPickListField
}

const customWidgets: Partial<Record<CustomWidgetTypes | interfaces.WidgetTypes, interfaces.CustomWidgetDescriptor>> = {
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
    [WidgetTypes.AssocListPopup]: AssocListPopup,
    [WidgetTypes.PickListPopup]: PickListPopup,
    [WidgetTypes.SecondLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [WidgetTypes.ThirdLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [WidgetTypes.FourthLevelMenu]: { component: LevelMenu, card: EmptyCard },
    [CustomWidgetTypes.StatsBlock]: { component: StatsBlock, card: EmptyCard }
}

function View() {
    const debugMode = useAppSelector(state => state.session.debugMode || false)
    const widgets = useAppSelector(state => state.view.widgets)

    return (
        <div className={styles.container}>
            {debugMode && <ViewInfoLabel />}
            <FileViewerPopup />
            <CxboxView
                customWidgets={customWidgets as Record<string, interfaces.CustomWidgetDescriptor>}
                customFields={customFields}
                card={Card as any}
                skipWidgetTypes={skipWidgetTypes}
                customLayout={DashboardLayout}
                disableDebugMode={true}
            />
            {debugMode &&
                widgets.filter(i => allPopupWidgetTypes.includes(i.type)).map(i => <PopupWidgetInfoLabel key={i.name} meta={i} />)}
        </div>
    )
}

export default React.memo(View)
