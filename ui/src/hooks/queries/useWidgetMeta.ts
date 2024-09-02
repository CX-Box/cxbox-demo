import { useBcLocation } from '@hooks/useBcLocation'
import { useCallback } from 'react'
import { LoginResponse, WidgetFormMeta, WidgetInfoMeta, WidgetMeta, WidgetTableMeta } from '@cxbox-ui/core'
import { useMeta } from './useMeta'
import { UseQueryResult } from '@tanstack/react-query'

type Meta<T = WidgetMeta> = (widgetName: string) => UseQueryResult<T | undefined>

export const useWidgetMeta: Meta = (widgetName: string) => {
    const [location] = useBcLocation()

    const widgetSelector = useCallback(
        (data: LoginResponse) => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            const view =
                screen?.meta?.views.find(view => view.name === location.viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]

            return view?.widgets.find(widget => widget.name === widgetName)
        },
        [location.screenName, location.viewName, widgetName]
    )

    return useMeta(widgetSelector)
}

export const useTableWidgetMeta = useWidgetMeta as Meta<WidgetTableMeta>
export const useFormWidgetMeta = useWidgetMeta as Meta<WidgetFormMeta>
export const useInfoWidgetMeta = useWidgetMeta as Meta<WidgetInfoMeta>
