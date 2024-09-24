import { MenuItem } from '@interfaces/navigation'
import { getStandardViewTabs } from '@components/ViewNavigation/tab/standard/utils/getStandardViewTabs'
import { ViewMetaResponse } from '@interfaces/session'

export const getDefaultVisibleView = (
    navigation: MenuItem[] | undefined,
    availableViews: ViewMetaResponse[],
    options: { idKey?: string } = {}
) => {
    return getStandardViewTabs(navigation, availableViews, 1, undefined, options)?.[0]?.viewName
}
